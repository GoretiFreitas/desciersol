import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

/**
 * API Route: Upload File to Arweave
 * 
 * NOTA: Esta versão calcula o hash mas não faz upload real.
 * Para produção, integre com:
 * - Irys SDK (https://irys.xyz)
 * - Turbo SDK (https://ardrive.io/turbo)
 * - Ou configure uma Edge Function dedicada
 */

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

    // TODO: Implementar upload real para Arweave usando Irys/Turbo
    // Por enquanto, retorna placeholder
    const uri = `https://arweave.net/${hash}`;

    return NextResponse.json({
      uri,
      hash: fileHash,
      filename: file.name,
      size: buffer.length,
      uploaded: false, // Indica que é placeholder
      message: 'File hash calculated. Real upload not implemented yet.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

