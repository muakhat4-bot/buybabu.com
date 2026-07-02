import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@villex/supabase';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // all, image, video, document
    const q = searchParams.get('q'); // search query

    let query = supabaseAdmin
      .from('attachments')
      .select('*')
      .order('created_at', { ascending: false });

    if (q) {
      query = query.ilike('file_name', `%${q}%`);
    }

    const { data: dbAttachments, error } = await query;
    if (error) throw error;

    let attachments = (dbAttachments || []).map(a => ({
      id: a.id,
      fileName: a.file_name,
      fileUrl: a.file_url,
      fileType: a.file_type,
      fileSize: a.file_size,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }));

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

    const { data: attachment, error: findError } = await supabaseAdmin
      .from('attachments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Extract bucket name and file path from file_url
    let bucketName = 'temporary-files';
    let storageFilePath = '';

    try {
      const parsedUrl = new URL(attachment.file_url);
      const pathParts = parsedUrl.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
        bucketName = pathParts[publicIndex + 1] || 'temporary-files';
        storageFilePath = decodeURIComponent(pathParts.slice(publicIndex + 2).join('/'));
      }
    } catch (e) {
      storageFilePath = path.basename(attachment.file_url);
    }

    if (storageFilePath) {
      const { error: deleteError } = await supabaseAdmin.storage
        .from(bucketName)
        .remove([storageFilePath]);
      if (deleteError) {
        console.error(`Failed to delete from Supabase storage:`, deleteError);
      }
    }

    // Delete record from DB
    const { error: deleteDbError } = await supabaseAdmin
      .from('attachments')
      .delete()
      .eq('id', id);

    if (deleteDbError) throw deleteDbError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
