import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import * as path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
};

const MAX_SIZES = {
  image: 5 * 1024 * 1024,      // 5MB
  document: 10 * 1024 * 1024,  // 10MB
  video: 50 * 1024 * 1024      // 50MB
};

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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestBucket = formData.get('bucket') as string | undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const mimeType = file.type || 'application/octet-stream';
    const isImage = ALLOWED_MIME_TYPES.images.includes(mimeType);
    const isDoc = ALLOWED_MIME_TYPES.documents.includes(mimeType);
    const isVideo = ALLOWED_MIME_TYPES.videos.includes(mimeType);

    // 1. File Type Validation
    if (!isImage && !isDoc && !isVideo) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden: Unsupported file type. Allowed formats: images (JPEG/PNG/WEBP/SVG), documents (PDF/DOCX/TXT), and videos (MP4/WEBM).'
      }, { status: 400 });
    }

    // 2. File Size Validation
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

    // Create a unique file path
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.name);
    const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9-]/g, '_');
    const fileName = `${baseName}-${uniqueSuffix}${extension}`;

    const bucketName = getBucketName(file.name, mimeType, requestBucket);

    // Auto-create/ensure bucket exists
    try {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: true
      });
    } catch (e) {
      // Ignore if bucket already exists
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: mimeType,
        duplex: 'half'
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Save Attachment record to DB
    const { data: attachment, error: dbError } = await supabaseAdmin
      .from('attachments')
      .insert({
        file_name: file.name,
        file_url: publicUrl,
        file_type: mimeType,
        file_size: file.size
      })
      .select()
      .single();

    if (dbError) throw dbError;

    const mappedAttachment = {
      id: attachment.id,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      fileType: attachment.file_type,
      fileSize: attachment.file_size,
      createdAt: attachment.created_at,
      updatedAt: attachment.updated_at
    };

    return NextResponse.json({
      success: true,
      url: publicUrl,
      attachment: mappedAttachment
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
