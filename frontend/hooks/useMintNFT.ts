'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
// Metaplex no longer used in hook - using backend API instead

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

      console.log('🔧 Wallet:', wallet.publicKey.toString());
      console.log('🌐 Network:', process.env.NEXT_PUBLIC_NETWORK || 'devnet');

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

      // Use backend API to create NFT (solves mainnet issue)
      console.log('🎨 Creating NFT via backend API...');
      
      const collectionAddress = params.collectionAddress || 'HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6';
      console.log('📦 Collection Address:', collectionAddress);
      
      const mintResponse = await fetch('/api/nft/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadataUri,
          name: params.name,
          description: params.description,
          image: params.image,
          attributes: params.attributes,
          wallet: wallet.publicKey.toString(),
          collectionAddress,
        }),
      });

      if (!mintResponse.ok) {
        const errorData = await mintResponse.json();
        throw new Error(errorData.error || 'Failed to create NFT');
      }

      const mintResult = await mintResponse.json();
      
      console.log('✅ NFT created via backend!');
      console.log('🪙 Mint Address:', mintResult.mintAddress);
      console.log('📝 Signature:', mintResult.signature);
      console.log('🔍 Explorer:', mintResult.explorerUrl);

      setLoading(false);
      return {
        success: true,
        mintAddress: mintResult.mintAddress,
        signature: mintResult.signature,
      };
    } catch (err: any) {
      console.error('❌ Erro ao mintar NFT:', err);
      
      // Verificar se é erro de timeout (mas transação pode ter sido processada)
      const isTimeoutError = 
        err.message?.includes('expired') || 
        err.message?.includes('Blockhash not found') ||
        err.message?.includes('block height exceeded');
      
      if (isTimeoutError) {
        console.warn('⚠️ Timeout de confirmação - NFT pode ter sido criado mesmo assim');
        console.log('ℹ️ Verifique sua wallet ou Solana Explorer para confirmar');
        
        const timeoutMessage = 'Timeout de confirmação. O NFT pode ter sido criado - verifique sua wallet ou tente buscar na página Browse após alguns minutos.';
        setError(timeoutMessage);
        setLoading(false);
        
        // Retornar sucesso parcial com aviso
        return {
          success: false,
          error: timeoutMessage,
        };
      }
      
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

