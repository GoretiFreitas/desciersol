'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import { BadgeMetadata } from '@/lib/review-types';
import { BADGE_COLLECTION_ADDRESS } from '@/lib/constants';

interface MintBadgeParams {
  reviewerWallet: string;
  badgeLevel: number;
  reviewCount: number;
}

interface MintBadgeResult {
  success: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
}

export function useMintBadge() {
  const { connection: defaultConnection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintBadge = async (params: MintBadgeParams): Promise<MintBadgeResult> => {
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

      console.log('🏆 Mintando badge SBT...');
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

      // Criar metadata do badge
      const badgeMetadata: BadgeMetadata = {
        name: `Reviewer Badge Level ${params.badgeLevel}`,
        symbol: 'RB',
        description: `Soul-bound token badge for reviewer level ${params.badgeLevel}`,
        image: `https://arweave.net/badge-level-${params.badgeLevel}`,
        attributes: [
          { trait_type: 'Level', value: params.badgeLevel },
          { trait_type: 'Type', value: 'Reviewer Badge' },
          { trait_type: 'Review Count', value: params.reviewCount },
          { trait_type: 'Issued At', value: Date.now() },
        ],
        properties: {
          category: 'badge',
          badgeLevel: params.badgeLevel,
          reviewerWallet: params.reviewerWallet,
          reviewCount: params.reviewCount,
          issuedAt: Date.now(),
        }
      };

      console.log('📤 Uploading badge metadata...');
      
      // Upload metadata para Arweave
      const metadataUri = await metaplex.storage().uploadJson(badgeMetadata);
      console.log('✅ Metadata URI:', metadataUri);

      // Criar NFT do badge
      const badgeNft = await metaplex.nfts().create({
        name: badgeMetadata.name,
        symbol: badgeMetadata.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: 0, // SBT não tem royalties
        isMutable: false, // SBT não deve ser mutável
        isCollection: false,
        collection: BADGE_COLLECTION_ADDRESS !== 'TBD' ? new PublicKey(BADGE_COLLECTION_ADDRESS) : undefined,
        creators: [{
          address: wallet.publicKey,
          share: 100,
          verified: true,
        }],
        useExistingMint: undefined,
      });

      console.log('✅ Badge SBT mintado com sucesso!');
      console.log('🎯 Mint Address:', badgeNft.address.toString());
      console.log('🔍 Explorer:', `https://explorer.solana.com/address/${badgeNft.address.toString()}?cluster=devnet`);

      return {
        success: true,
        mintAddress: badgeNft.address.toString(),
        signature: badgeNft.response.signature,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao mintar badge:', errorMessage);
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
    mintBadge,
    loading,
    error,
  };
}
