'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';

interface UpdateNFTMetadataParams {
  mintAddress: string;
  newMetadataUri: string;
}

interface UpdateResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export function useUpdateNFTMetadata() {
  const { connection: defaultConnection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNFTMetadata = async (params: UpdateNFTMetadataParams): Promise<UpdateResult> => {
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

      console.log('🔄 Atualizando metadata do NFT...');
      console.log('📋 Parâmetros:', params);

      // Usar connection com configurações otimizadas
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
        {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 120000,
        }
      );

      // Criar instância do Metaplex
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // Buscar NFT atual
      const mintAddress = new PublicKey(params.mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress });

      console.log('📄 NFT encontrado:', nft.name);
      console.log('🔑 Update Authority:', nft.updateAuthorityAddress.toString());
      console.log('👤 Wallet atual:', wallet.publicKey.toString());

      // Verificar se a wallet é update authority
      if (!nft.updateAuthorityAddress.equals(wallet.publicKey)) {
        throw new Error(
          `Você não é a update authority deste NFT. Authority: ${nft.updateAuthorityAddress.toString()}`
        );
      }

      // Atualizar NFT
      console.log('📤 Atualizando URI para:', params.newMetadataUri);
      
      const updatedNft = await metaplex.nfts().update({
        nftOrSft: nft,
        uri: params.newMetadataUri,
      });

      console.log('✅ NFT atualizado com sucesso!');
      console.log('🎯 Nova URI:', updatedNft.uri);

      return {
        success: true,
        signature: updatedNft.response.signature,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao atualizar NFT:', errorMessage);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateNFTMetadata,
    loading,
    error,
  };
}
