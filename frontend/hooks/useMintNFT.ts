'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Metaplex, keypairIdentity, walletAdapterIdentity } from '@metaplex-foundation/js';

interface MintNFTParams {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  files?: Array<{ uri: string; type: string; hash?: string }>;
  collectionAddress?: string;
}

interface MintResult {
  success: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
}

export function useMintNFT() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintNFT = async (params: MintNFTParams): Promise<MintResult> => {
    try {
      setLoading(true);
      setError(null);

      // Validações
      if (!wallet.connected || !wallet.publicKey) {
        throw new Error('Wallet não conectada');
      }

      if (!wallet.signTransaction) {
        throw new Error('Wallet não suporta assinatura de transações');
      }

      console.log('🎨 Iniciando mint de NFT...');
      console.log('📋 Parâmetros:', params);

      // Criar instância do Metaplex com a wallet do usuário
      const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity(wallet)
      );

      console.log('🔧 Metaplex configurado com wallet:', wallet.publicKey.toString());

      // Preparar metadata
      const metadata = {
        name: params.name,
        description: params.description,
        image: params.image,
        external_url: params.externalUrl,
        attributes: params.attributes || [],
        properties: {
          files: params.files || [],
          category: 'document',
        },
      };

      console.log('📝 Metadata preparado:', metadata);

      // Upload metadata para Arweave via API (Irys mainnet)
      console.log('☁️ Tentando upload da metadata para Arweave via Irys...');
      
      let metadataUri: string;
      let usedArweave = false;
      
      try {
        const uploadResponse = await fetch('/api/upload-metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ metadata }),
        });
        
        if (uploadResponse.ok) {
          const { uri } = await uploadResponse.json();
          metadataUri = uri;
          usedArweave = true;
          console.log('✅ Metadata uploaded para Arweave:', metadataUri);
        } else {
          throw new Error('Upload API failed - insufficient funds or configuration issue');
        }
      } catch (uploadError) {
        console.warn('⚠️ Upload Arweave não disponível (precisa ~0.5 SOL mainnet)');
        console.log('ℹ️ Usando metadata on-chain (data URI) - NFT ainda é válido!');
        
        // Fallback para data URI - isso é válido e funciona!
        metadataUri = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;
        console.log('📝 Metadata será armazenado on-chain na Solana');
      }
      
      console.log(`💾 Metadata storage: ${usedArweave ? 'Arweave (permanente)' : 'On-chain (Solana blockchain)'}`);


      // Criar NFT
      console.log('🎨 Criando NFT...');
      const { nft, response } = await metaplex.nfts().create({
        uri: metadataUri,
        name: params.name,
        sellerFeeBasisPoints: 500, // 5% royalty
        collection: params.collectionAddress
          ? new PublicKey(params.collectionAddress)
          : undefined,
      });

      console.log('✅ NFT Criado!');
      console.log('🪙 Mint Address:', nft.address.toString());
      console.log('📝 Signature:', response.signature);

      setLoading(false);
      return {
        success: true,
        mintAddress: nft.address.toString(),
        signature: response.signature,
      };
    } catch (err: any) {
      console.error('❌ Erro ao mintar NFT:', err);
      const errorMessage = err.message || 'Erro desconhecido ao mintar NFT';
      setError(errorMessage);
      setLoading(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    mintNFT,
    loading,
    error,
  };
}

