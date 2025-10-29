import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { RPC_ENDPOINT, COLLECTION_ADDRESS } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed',
    });
    const metaplex = Metaplex.make(connection);

    console.log('🔍 Buscando NFTs da collection:', COLLECTION_ADDRESS.toString());
    console.log('🌐 RPC:', RPC_ENDPOINT);

    // Criar timeout para evitar travamento
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout after 30s')), 30000)
    );

    // Find NFTs by collection com timeout
    const fetchNfts = (async () => {
      try {
        // Tentar buscar por collection
        const nfts = await metaplex.nfts().findAllByCollection({
          collection: COLLECTION_ADDRESS,
        });
        console.log('✅ Encontrados', nfts.length, 'NFTs via findAllByCollection');
        return nfts;
      } catch (collectionError) {
        console.warn('⚠️ findAllByCollection falhou:', collectionError);
        console.log('🔄 Tentando findAllByCreator...');
        
        // Fallback: buscar por creator
        const nfts = await metaplex.nfts().findAllByCreator({
          creator: COLLECTION_ADDRESS,
        });
        console.log('✅ Encontrados', nfts.length, 'NFTs via findAllByCreator');
        return nfts;
      }
    })();

    const nfts = await Promise.race([fetchNfts, timeout]) as any[];

    // Fetch metadata for each NFT (com limite)
    const nftData = await Promise.all(
      nfts.slice(0, 50).map(async (nft) => { // Limitar a 50 NFTs
        try {
          // Load full NFT data com timeout
          const loadTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Load timeout')), 5000)
          );
          
          const loadNft = metaplex.nfts().load({ metadata: nft as any });
          const fullNft = await Promise.race([loadNft, loadTimeout]);
          
          console.log('📄 NFT carregado:', nft.name);
          
          return {
            address: nft.address.toString(),
            name: nft.name,
            uri: nft.uri,
            json: (fullNft as any).json || null,
          };
        } catch (err) {
          console.warn(`⚠️ Skipped NFT ${nft.address}:`, err instanceof Error ? err.message : 'timeout');
          // Retornar dados básicos mesmo se metadata falhar
          return {
            address: nft.address.toString(),
            name: nft.name,
            uri: nft.uri,
            json: null,
          };
        }
      })
    );

    // Filter out null
    let validNfts = nftData.filter((nft) => nft !== null);

    console.log('✅ Total NFTs on-chain:', validNfts.length);

    // Se collection estiver vazia, usar papers demo
    if (validNfts.length === 0) {
      try {
        const papersFile = path.join(process.cwd(), 'data', 'papers.json');
        const papersData = await fs.readFile(papersFile, 'utf-8');
        const data = JSON.parse(papersData);
        
        if (data.papers && data.papers.length > 0) {
          validNfts = data.papers;
          console.log('📝 Usando', validNfts.length, 'papers demo para testes');
        }
      } catch (demoError) {
        console.log('ℹ️ Nenhum paper demo disponível');
      }
    }

    console.log('✅ Total NFTs retornados:', validNfts.length);

    return NextResponse.json({
      collection: COLLECTION_ADDRESS.toString(),
      count: validNfts.length,
      nfts: validNfts,
    });
  } catch (error) {
    console.error('❌ Collection fetch error:', error);
    
    // Em caso de erro, tentar carregar papers demo
    try {
      const papersFile = path.join(process.cwd(), 'data', 'papers.json');
      const papersData = await fs.readFile(papersFile, 'utf-8');
      const data = JSON.parse(papersData);
      
      console.log('📝 Usando papers demo devido a erro');
      
      return NextResponse.json({
        collection: COLLECTION_ADDRESS.toString(),
        count: data.papers?.length || 0,
        nfts: data.papers || [],
        error: error instanceof Error ? error.message : 'Failed to fetch collection (usando demo)',
      });
    } catch (demoError) {
      // Último fallback: retornar vazio
      return NextResponse.json({
        collection: COLLECTION_ADDRESS.toString(),
        count: 0,
        nfts: [],
        error: error instanceof Error ? error.message : 'Failed to fetch collection',
      });
    }
  }
}

