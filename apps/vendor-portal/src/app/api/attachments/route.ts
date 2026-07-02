import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project-id.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const supabaseServer = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // all, image, video, document
    const q = searchParams.get('q'); // search query

    let attachments = await prisma.attachment.findMany({
      where: q ? { fileName: { contains: q, mode: 'insensitive' } } : {},
      orderBy: { createdAt: 'desc' }
    });

    if (type && type !== 'all') {
      if (type === 'image') {
        attachments = attachments.filter(a => a.fileType.startsWith('image/'));
      } else if (type === 'video') {
        attachments = attachments.filter(a => a.fileType.startsWith('video/'));
      } else if (type === 'document') {
        attachments = attachments.filter(a => !a.fileType.startsWith('image/') && !a.fileType.startsWith('video/'));
      }
    }

    return NextResponse.json(attachments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Attachment ID is required' }, { status: 400 });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id }
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Extract bucket name and file path from publicUrl
    let bucketName = 'temporary-files';
    let storageFilePath = '';

    try {
      const parsedUrl = new URL(attachment.fileUrl);
      const pathParts = parsedUrl.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
        bucketName = pathParts[publicIndex + 1] || 'temporary-files';
        storageFilePath = decodeURIComponent(pathParts.slice(publicIndex + 2).join('/'));
      }
    } catch (e) {
      storageFilePath = path.basename(attachment.fileUrl);
    }

    if (storageFilePath) {
      const { error: deleteError } = await supabaseServer.storage
        .from(bucketName)
        .remove([storageFilePath]);
      if (deleteError) {
        console.error(`Failed to delete from Supabase storage:`, deleteError);
      }
    }

    // Delete record from DB
    await prisma.attachment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
