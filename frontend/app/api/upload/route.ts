import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';
import bs58 from 'bs58';

/**
 * API Route: Upload múltiplos arquivos para Arweave via Irys
 * Aceita: PDF + imagens (capa e NFT)
 */

interface UploadResult {
  pdfUri?: string;
  pdfHash?: string;
  coverImageUri?: string;
  nftImageUri?: string;
  uploaded: boolean;
}

/**
 * Criar Irys uploader
 */
async function createIrysUploader() {
  const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY;
  
  if (!privateKeyBase58) {
    throw new Error('IRYS_PRIVATE_KEY or WALLET_PRIVATE_KEY not configured');
  }

  const useDevnet = process.env.NETWORK === 'devnet';
  
  let uploader;
  if (useDevnet) {
    uploader = await Uploader(Solana)
      .withWallet(privateKeyBase58)
      .withRpc('https://api.devnet.solana.com')
      .devnet();
  } else {
    uploader = await Uploader(Solana)
      .withWallet(privateKeyBase58);
  }

  return uploader;
}

/**
 * Upload arquivo para Arweave
 */
async function uploadToArweave(
  uploader: any,
  fileBuffer: Buffer,
  contentType: string,
  filename: string
): Promise<{ uri: string; hash: string }> {
  // Calcular hash
  const hash = createHash('sha256').update(fileBuffer).digest('hex');
  const fileHash = `sha256:${hash}`;

  // Preparar tags
  const tags = [
    { name: 'Content-Type', value: contentType },
    { name: 'App-Name', value: 'Solana Research Assets' },
    { name: 'App-Version', value: '1.0.0' },
    { name: 'File-Name', value: filename },
    { name: 'File-Hash', value: fileHash },
  ];

  try {
    // Upload para Arweave via Irys
    const receipt = await uploader.upload(fileBuffer, { tags });
    
    return {
      uri: `https://gateway.irys.xyz/${receipt.id}`,
      hash: fileHash,
    };
  } catch (error) {
    console.error('Erro no upload Irys:', error);
    throw new Error(`Falha no upload: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const pdfFile = formData.get('pdf') as File | null;
    const coverImageFile = formData.get('coverImage') as File | null;
    const nftImageFile = formData.get('nftImage') as File | null;

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'Arquivo PDF é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo PDF
    if (pdfFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Arquivo deve ser PDF' },
        { status: 400 }
      );
    }

    // Validar imagens se fornecidas
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (coverImageFile && !imageTypes.includes(coverImageFile.type)) {
      return NextResponse.json(
        { error: 'Imagem de capa deve ser JPG, PNG ou WebP' },
        { status: 400 }
      );
    }

    if (nftImageFile && !imageTypes.includes(nftImageFile.type)) {
      return NextResponse.json(
        { error: 'Imagem do NFT deve ser JPG, PNG ou WebP' },
        { status: 400 }
      );
    }

    const result: UploadResult = { uploaded: false };

    // Verificar se Irys está configurado
    const hasIrysConfig = process.env.IRYS_PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY;

    if (hasIrysConfig) {
      try {
        console.log('🚀 Iniciando upload para Arweave via Irys...');
        const uploader = await createIrysUploader();

        // Upload PDF
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfBytes);
        const pdfResult = await uploadToArweave(
          uploader,
          pdfBuffer,
          pdfFile.type,
          pdfFile.name
        );
        result.pdfUri = pdfResult.uri;
        result.pdfHash = pdfResult.hash;
        console.log('✅ PDF uploaded:', result.pdfUri);

        // Upload Cover Image (opcional)
        if (coverImageFile) {
          const coverBytes = await coverImageFile.arrayBuffer();
          const coverBuffer = Buffer.from(coverBytes);
          const coverResult = await uploadToArweave(
            uploader,
            coverBuffer,
            coverImageFile.type,
            coverImageFile.name
          );
          result.coverImageUri = coverResult.uri;
          console.log('✅ Cover image uploaded:', result.coverImageUri);
        }

        // Upload NFT Image (opcional)
        if (nftImageFile) {
          const nftBytes = await nftImageFile.arrayBuffer();
          const nftBuffer = Buffer.from(nftBytes);
          const nftResult = await uploadToArweave(
            uploader,
            nftBuffer,
            nftImageFile.type,
            nftImageFile.name
          );
          result.nftImageUri = nftResult.uri;
          console.log('✅ NFT image uploaded:', result.nftImageUri);
        }

        result.uploaded = true;
      } catch (uploadError) {
        console.error('❌ Erro no upload Irys:', uploadError);
        
        // Fallback para placeholder em caso de erro
        console.warn('⚠️  Usando placeholders devido a erro no upload');
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfBuffer = Buffer.from(pdfBytes);
        const hash = createHash('sha256').update(pdfBuffer).digest('hex');
        
        result.pdfUri = `https://arweave.net/placeholder-${hash}`;
        result.pdfHash = `sha256:${hash}`;
        result.uploaded = false;

        if (coverImageFile) {
          result.coverImageUri = `https://arweave.net/placeholder-cover-${Date.now()}`;
        }
        if (nftImageFile) {
          result.nftImageUri = `https://arweave.net/placeholder-nft-${Date.now()}`;
        }
      }
    } else {
      // Modo placeholder (sem configuração Irys)
      console.warn('⚠️  IRYS_PRIVATE_KEY não configurado. Usando placeholders.');
      
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfBuffer = Buffer.from(pdfBytes);
      const hash = createHash('sha256').update(pdfBuffer).digest('hex');
      
      result.pdfUri = `https://arweave.net/placeholder-${hash}`;
      result.pdfHash = `sha256:${hash}`;

      if (coverImageFile) {
        result.coverImageUri = `https://arweave.net/placeholder-cover-${Date.now()}`;
      }
      if (nftImageFile) {
        result.nftImageUri = `https://arweave.net/placeholder-nft-${Date.now()}`;
      }
    }

    return NextResponse.json({
      ...result,
      message: result.uploaded 
        ? 'Arquivos enviados com sucesso para Arweave'
        : 'Hashes calculados. Upload real não implementado ainda.',
    });
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    return NextResponse.json(
      {
        error: 'Falha ao processar arquivos',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
