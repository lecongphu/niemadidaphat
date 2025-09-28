import { NextRequest, NextResponse } from 'next/server';
import { r2Storage } from '@/lib/r2Storage';

export async function POST(request: NextRequest) {
  try {
    const { prefix } = await request.json();

    if (!prefix) {
      return NextResponse.json({ error: 'Prefix is required' }, { status: 400 });
    }

    // List files from R2 with prefix
    const files = await r2Storage.listFiles(prefix);

    return NextResponse.json({
      success: true,
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('R2 list files error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list files', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
