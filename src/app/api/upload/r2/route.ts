export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { r2StorageEdge } from '@/lib/r2StorageEdge';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
    const slug = formData.get('slug') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate file path with slug-based folder structure
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${cleanFileName}`;
    
    // Create folder structure: folder/slug/filename
    let filePath = fileName;
    if (folder && slug) {
      filePath = `${folder}/${slug}/${fileName}`;
    } else if (folder) {
      filePath = `${folder}/${fileName}`;
    } else if (slug) {
      filePath = `${slug}/${fileName}`;
    }

    // Convert file to buffer for R2 upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await r2StorageEdge.uploadFile(filePath, buffer, file.type);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to upload file to R2', 
        details: result.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filePath: filePath,
      storageUsed: 'r2',
    });
  } catch (error) {
    console.error('R2 storage upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
