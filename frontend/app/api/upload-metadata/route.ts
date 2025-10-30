import { NextRequest, NextResponse } from 'next/server';
import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';

/**
 * API Route: Upload metadata JSON para Arweave via Irys
 * Usa a mesma configuração que funcionava antes
 */

async function createIrysUploader() {
  const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY;
  
  if (!privateKeyBase58) {
    throw new Error('IRYS_PRIVATE_KEY not configured');
  }

  const useDevnet = process.env.NETWORK === 'devnet' || !process.env.NETWORK; // Default to devnet if not set
  
  if (useDevnet) {
    // Usar Irys DEVNET
    const uploader = await Uploader(Solana)
      .withWallet(privateKeyBase58)
      .withRpc('https://api.devnet.solana.com')
      .devnet();
    
    return uploader;
  } else {
    // Usar Irys MAINNET com Helius RPC
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const uploader = await Uploader(Solana)
      .withWallet(privateKeyBase58)
      .withRpc(rpcUrl);
    
    return uploader;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { metadata } = await request.json();
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'Metadata é obrigatória' },
        { status: 400 }
      );
    }

    console.log('📤 Iniciando upload de metadata para Arweave...');

    // Criar uploader Irys
    const uploader = await createIrysUploader();
    
    // Converter metadata para JSON
    const metadataJson = JSON.stringify(metadata);
    const metadataBuffer = Buffer.from(metadataJson);
    
    // Tags para o Arweave
    const tags = [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'App-Name', value: 'DeSci Reviews' },
      { name: 'App-Version', value: '1.0.0' },
      { name: 'Type', value: 'NFT-Metadata' },
    ];

    // Upload para Arweave
    const network = process.env.NETWORK === 'devnet' ? 'devnet' : 'mainnet';
    console.log(`☁️ Fazendo upload via Irys ${network}...`);
    const receipt = await uploader.upload(metadataBuffer, { tags });
    
    const uri = `https://gateway.irys.xyz/${receipt.id}`;
    
    console.log('✅ Metadata uploaded com sucesso!');
    console.log('📍 URI:', uri);
    console.log('💰 Custo:', receipt.cost, 'lamports');

    return NextResponse.json({
      success: true,
      uri,
      id: receipt.id,
      cost: receipt.cost,
    });

  } catch (error) {
    console.error('❌ Erro ao fazer upload de metadata:', error);
    
    return NextResponse.json(
      {
        error: 'Falha ao fazer upload de metadata',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

