import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { RPC_ENDPOINT, COLLECTION_ADDRESS } from '@/lib/constants';
import bs58 from 'bs58';

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed',
    });
    const metaplex = Metaplex.make(connection);

    console.log('🔍 Buscando NFTs da collection:', COLLECTION_ADDRESS.toString());
    console.log('🌐 RPC:', RPC_ENDPOINT);

    // Criar timeout para evitar travamento (30s)
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout after 30s')), 30000)
    );

    // Find NFTs by collection com timeout
    const fetchNfts = (async () => {
      try {
        // Usar Helius getAssetsByGroup API se disponível
        if (RPC_ENDPOINT.includes('helius')) {
          console.log('🔍 Using Helius getAssetsByGroup API...');
          const response = await fetch(RPC_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getAssetsByGroup',
              params: {
                groupKey: 'collection',
                groupValue: COLLECTION_ADDRESS.toString(),
              },
            }),
          });
          
          const data = await response.json();
          console.log('✅ Helius response:', data.result?.total || 0, 'total NFTs');
          
          if (data.result && data.result.items) {
            // Converter formato Helius para formato Metaplex
            const convertedNfts = data.result.items.map((asset: any) => ({
              address: new PublicKey(asset.id),
              name: asset.content?.metadata?.name || 'Untitled',
              uri: asset.content?.json_uri || '',
              collection: asset.grouping?.find((g: any) => g.group_key === 'collection')?.group_value || null,
            }));
            console.log('✅ Converted', convertedNfts.length, 'NFTs from Helius');
            return convertedNfts;
          }
        }
        
        // Fallback: Tentar buscar por collection via Metaplex
        console.log('🔄 Falling back to Metaplex findAllByCollection...');
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

    let nfts = await Promise.race([fetchNfts, timeout]) as any[];

    // Se não encontrou NFTs via collection, buscar na backend wallet
    if (nfts.length === 0) {
      console.log('🔄 No NFTs found via collection, searching backend wallet...');
      try {
        const backendWalletPublicKey = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
        if (backendWalletPublicKey) {
          const backendWallet = new PublicKey(backendWalletPublicKey);
          const walletNfts = await metaplex.nfts().findAllByOwner({ owner: backendWallet });
          console.log('✅ Found', walletNfts.length, 'NFTs in backend wallet');
          nfts = walletNfts;
        }
      } catch (walletError) {
        console.warn('⚠️ Backend wallet search failed:', walletError);
      }
    }

    // Fetch metadata for each NFT (com limite reduzido para 10 NFTs)
    const nftData = await Promise.all(
      nfts.slice(0, 10).map(async (nft) => { // Limitar a 10 NFTs para melhor performance
        try {
          // Load full NFT data com timeout
          const loadTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Load timeout')), 5000)
          );
          
          const loadNft = metaplex.nfts().load({ metadata: nft as any });
          const fullNft = await Promise.race([loadNft, loadTimeout]);
          
          console.log('📄 NFT carregado:', nft.name);
          
          // Check if it's a badge or collection (exclude from research papers)
          const isBadge = nft.name?.includes('Reviewer Badge') || 
                         nft.name?.includes('Badges') ||
                         nft.name?.includes('Collection') ||
                         nft.symbol === 'SBTBADGE' ||
                         nft.symbol === 'DSBADGE' ||
                         (fullNft as any).json?.properties?.category === 'badge' ||
                         (fullNft as any).json?.properties?.soulBound === true;
          
          if (isBadge) {
            console.log('🚫 Excluindo badge/collection:', nft.name);
            return null; // Skip badges and collections
          }
          
          return {
            address: nft.address.toString(),
            name: nft.name,
            uri: nft.uri,
            json: (fullNft as any).json || null,
            collection: (fullNft as any).collection?.address?.toString() || null,
          };
        } catch (err) {
          console.warn(`⚠️ Skipped NFT ${nft.address}:`, err instanceof Error ? err.message : 'timeout');
          // Retornar dados básicos mesmo se metadata falhar
          return {
            address: nft.address.toString(),
            name: nft.name,
            uri: nft.uri,
            json: null,
            collection: null,
          };
        }
      })
    );

    // Filter out null
    const validNfts = nftData.filter((nft) => nft !== null);

    console.log('✅ Total NFTs retornados:', validNfts.length);

    return NextResponse.json({
      collection: COLLECTION_ADDRESS.toString(),
      count: validNfts.length,
      nfts: validNfts,
    });
  } catch (error) {
    console.error('❌ Collection fetch error:', error);
    
    // Retornar vazio em caso de erro
    return NextResponse.json({
      collection: COLLECTION_ADDRESS.toString(),
      count: 0,
      nfts: [],
      error: error instanceof Error ? error.message : 'Failed to fetch collection',
    });
  }
}

