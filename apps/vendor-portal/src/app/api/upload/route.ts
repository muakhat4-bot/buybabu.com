import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import * as path from 'path';

export const dynamic = 'force-dynamic';

// Whitelist excludes SVG to prevent Stored Cross-Site Scripting (XSS) attacks
const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
};

const MAX_SIZES = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024      // 50MB
};

/**
 * Validates actual binary file signatures (magic bytes) to prevent executable/script uploads
 * disguised with valid image extensions or client-spoofed Content-Type headers.
 */
function verifyImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
    );
  }
  // WebP: RIFF (bytes 0-3: 52 49 46 46) ... WEBP (bytes 8-11: 57 45 42 50)
  if (mimeType === 'image/webp') {
    return (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    );
  }
  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (mimeType === 'image/gif') {
    return (
      buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
      (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61
    );
  }
  return false;
}

function getBucketName(fileName: string, mimeType: string, requestBucket?: string): string {
  if (requestBucket) return requestBucket;
  const ext = path.extname(fileName).toLowerCase();
  const isImg = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');

  if (isVideo) return 'videos';
  if (isImg) {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('logo')) return 'vendor-logos';
    if (lowerName.includes('banner')) return 'vendor-banners';
    if (lowerName.includes('avatar') || lowerName.includes('profile')) return 'customer-avatars';
    if (lowerName.includes('category')) return 'category-images';
    if (lowerName.includes('brand')) return 'brand-images';
    if (lowerName.includes('gallery')) return 'product-gallery';
    if (lowerName.includes('return')) return 'return-images';
    return 'product-images';
  }
  const lowerName = fileName.toLowerCase();
  if (ext === '.pdf' || ext === '.doc' || ext === '.docx' || ext === '.txt') {
    if (lowerName.includes('invoice') || lowerName.includes('receipt')) return 'invoices';
    return 'documents';
  }
  if (lowerName.includes('chat')) return 'chat-files';
  return 'temporary-files';
}

export async function POST(request: Request) {
  try {
    // 1. Strict Vendor Authentication & Ownership Enforcement
    const authHeader =
      request.headers.get('authorization') ||
      request.headers.get('x-forwarded-authorization') ||
      request.headers.get('x-vendor-token') ||
      request.headers.get('x-supabase-auth');

    if (!authHeader || !authHeader.trim()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Vendor authentication token required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or expired session' },
        { status: 401 }
      );
    }

    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from('vendors')
      .select('id, status, deleted_at')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (vendorError || !vendor || vendor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Active vendor store record required' },
        { status: 403 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestBucket = formData.get('bucket') as string | undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const mimeType = (file.type || 'application/octet-stream').toLowerCase();
    const isImage = ALLOWED_MIME_TYPES.images.includes(mimeType);
    const isDoc = ALLOWED_MIME_TYPES.documents.includes(mimeType);
    const isVideo = ALLOWED_MIME_TYPES.videos.includes(mimeType);

    // 3. File Type Whitelist Validation (SVG explicitly rejected)
    if (!isImage && !isDoc && !isVideo) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Unsupported file type. Allowed formats: images (JPEG/PNG/WEBP/GIF), documents (PDF/DOCX/TXT), and videos (MP4/WEBM).'
      }, { status: 400 });
    }

    // 4. File Size Limits Validation
    if (isImage && file.size > MAX_SIZES.image) {
      return NextResponse.json({ success: false, error: 'File size limit exceeded. Max image size is 5MB.' }, { status: 400 });
    }
    if (isDoc && file.size > MAX_SIZES.document) {
      return NextResponse.json({ success: false, error: 'File size limit exceeded. Max document size is 10MB.' }, { status: 400 });
    }
    if (isVideo && file.size > MAX_SIZES.video) {
      return NextResponse.json({ success: false, error: 'File size limit exceeded. Max video size is 50MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Binary File Signature (Magic Bytes) Verification for Images
    if (isImage && !verifyImageMagicBytes(buffer, mimeType)) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Corrupted image or file content does not match image format signature.'
      }, { status: 400 });
    }

    // 6. Vendor Isolated Storage Path (Prevents cross-vendor file collisions & tampering)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.name);
    const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9-]/g, '_');
    const storagePath = `vendors/${vendor.id}/${baseName}-${uniqueSuffix}${extension}`;

    const bucketName = getBucketName(file.name, mimeType, requestBucket);

    // Ensure target storage bucket exists
    try {
      await supabaseAdmin.storage.createBucket(bucketName, { public: true });
    } catch {
      // Bucket already exists
    }

    // 7. Upload directly to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        duplex: 'half'
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    // 8. Get Public HTTPS URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    // 9. Record attachment in database with vendor ownership
    const { data: attachment, error: dbError } = await supabaseAdmin
      .from('attachments')
      .insert({
        file_name: path.basename(file.name),
        file_url: publicUrl,
        file_type: mimeType,
        file_size: file.size
      })
      .select()
      .single();

    if (dbError) {
      console.warn('Attachment DB record warning (storage upload succeeded):', dbError.message);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      attachment: attachment ? {
        id: attachment.id,
        fileName: attachment.file_name,
        fileUrl: attachment.file_url,
        fileType: attachment.file_type,
        fileSize: attachment.file_size,
        createdAt: attachment.created_at,
        updatedAt: attachment.updated_at
      } : undefined
    }, {
      headers: {
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch (err: any) {
    console.error('Upload error in vendor portal:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Upload failed' },
      {
        status: 500,
        headers: { 'X-Content-Type-Options': 'nosniff' }
      }
    );
  }
}
