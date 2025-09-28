export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { r2Storage } from '@/lib/r2Storage';

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

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Generate file path
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Cloudflare R2
    const result = await r2Storage.uploadFromFormData(formData, filePath);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to upload file to R2 storage', 
        details: result.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filePath: filePath,
    });
  } catch (error) {
    console.error('R2 storage upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
