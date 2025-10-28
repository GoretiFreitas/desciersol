import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Mint Research NFT
 * 
 * NOTA: Esta é uma versão placeholder compatível com Vercel Serverless.
 * Para produção, implemente a lógica de mint usando:
 * - Vercel Edge Functions com Web Crypto API
 * - Ou mova a lógica para um servidor dedicado
 * - Ou use uma solução como @metaplex-foundation/umi com wallet do backend
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      authors,
      description,
      tags,
      doi,
      license,
      version,
      pdfUri,
      pdfHash,
      coverImageUri,
      nftImageUri,
      collection,
      wallet,
    } = body;

    if (!title || !authors || !pdfUri || !pdfHash) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando (title, authors, pdfUri, pdfHash)' },
        { status: 400 }
      );
    }

    // Preparar metadata do NFT
    const metadata = {
      name: title,
      description: description || '',
      image: nftImageUri || coverImageUri || '',
      external_url: pdfUri,
      attributes: [
        {
          trait_type: 'Authors',
          value: authors,
        },
        {
          trait_type: 'Version',
          value: version || '1.0.0',
        },
        {
          trait_type: 'License',
          value: license || 'CC-BY-4.0',
        },
        ...(doi ? [{ trait_type: 'DOI', value: doi }] : []),
        ...(tags ? [{ trait_type: 'Tags', value: tags }] : []),
      ],
      properties: {
        files: [
          {
            uri: pdfUri,
            type: 'application/pdf',
            hash: pdfHash,
          },
          ...(coverImageUri ? [{
            uri: coverImageUri,
            type: 'image',
            role: 'cover',
          }] : []),
        ],
        category: 'document',
        creators: wallet ? [
          {
            address: wallet,
            share: 100,
          }
        ] : [],
      },
    };

    // TODO: Implementar mint serverless usando @metaplex-foundation/umi
    // Por enquanto, retorna sucesso simulado com metadata
    
    console.log('📝 Metadata preparado:', JSON.stringify(metadata, null, 2));
    
    return NextResponse.json(
      {
        success: false,
        message: 'Mint API ainda não implementado para ambiente serverless',
        note: 'Por favor, implemente usando Vercel Edge Functions, servidor dedicado, ou cliente Web3',
        mint: 'SimulatedMintAddress' + Date.now(),
        metadata,
        receivedData: {
          title,
          authors,
          pdfUri,
          pdfHash,
          coverImageUri,
          nftImageUri,
          hasCollection: !!collection,
        },
      },
      { status: 200 } // Retorna 200 para não bloquear o fluxo no frontend
    );

  } catch (error) {
    console.error('Mint error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process mint request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

