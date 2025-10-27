import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Calculate SHA-256 hash
    const hash = createHash('sha256').update(buffer).digest('hex');
    const fileHash = `sha256:${hash}`;

    // Save temporarily for backend script
    const tmpPath = join('/tmp', `upload_${Date.now()}_${file.name}`);
    await writeFile(tmpPath, buffer);

    // For now, return a placeholder URI
    // In production, this would use Irys/Turbo to upload to Arweave
    const uri = `https://arweave.net/${hash}`;

    // Clean up temp file
    await unlink(tmpPath);

    return NextResponse.json({
      uri,
      hash: fileHash,
      filename: file.name,
      size: buffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

