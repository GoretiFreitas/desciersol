'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { BadgeMetadata } from '@/lib/review-types';

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

      console.log('🏆 Mintando badge SBT diretamente na wallet do revisor...');
      console.log('📋 Parâmetros:', params);

      // Usar connection com configurações otimizadas e timeout maior
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
        {
          commitment: 'processed', // Use processed for faster confirmation
          confirmTransactionInitialTimeout: 180 * 1000, // 180 seconds
        }
      );

      const metaplex = Metaplex.make(connection);
      const reviewerPubkey = wallet.publicKey;

      // Badge configuration
      const badgeConfig = {
        name: `Reviewer Badge Level ${params.badgeLevel}`,
        symbol: 'SBTBADGE',
        description: `Soul-bound token badge for reviewer level ${params.badgeLevel}`,
        image: `https://arweave.net/badge-level-${params.badgeLevel}`,
      };

      // Create badge metadata
      const badgeMetadata: BadgeMetadata = {
        name: badgeConfig.name,
        symbol: badgeConfig.symbol,
        description: `Este é um Soul-Bound Token (SBT) que representa o nível de reputação de um revisor na plataforma deScier. Nível: ${params.badgeLevel}.`,
        image: badgeConfig.image,
        attributes: [
          { trait_type: 'Type', value: 'Reviewer Badge' },
          { trait_type: 'Level', value: params.badgeLevel },
          { trait_type: 'Review Count', value: params.reviewCount },
          { trait_type: 'Issued At', value: new Date().toISOString() },
          { trait_type: 'Reviewer', value: params.reviewerWallet },
        ],
        properties: {
          category: 'badge',
          badgeLevel: params.badgeLevel,
          reviewerWallet: params.reviewerWallet,
          reviewCount: params.reviewCount,
          issuedAt: Date.now(),
        },
      };

      // Upload metadata to Arweave
      console.log('📤 Uploading badge metadata to Arweave...');
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upload-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: badgeMetadata,
          tags: {
            'App-Name': 'DeSci-Reviews',
            'Badge-Level': params.badgeLevel.toString(),
            'Reviewer-Wallet': params.reviewerWallet,
          }
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload badge metadata');
      }

      const uploadResult = await uploadResponse.json();
      const metadataUri = uploadResult.uri;
      console.log('✅ Metadata URI:', metadataUri);

      // Use backend API for minting (solves mainnet wallet issues)
      console.log('🪙 Criando SBT badge via backend API...');
      
      const mintResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/badge/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerWallet: params.reviewerWallet,
          badgeLevel: params.badgeLevel,
          reviewCount: params.reviewCount,
          metadataUri,
          name: badgeMetadata.name,
          symbol: badgeMetadata.symbol,
        }),
      });

      if (!mintResponse.ok) {
        throw new Error('Failed to mint badge');
      }

      const mintResult = await mintResponse.json();
      
      console.log('✅ Badge mintado via backend!');
      console.log('🎯 Mint Address:', mintResult.mintAddress);
      console.log('🔍 Explorer:', mintResult.explorerUrl);

      return {
        success: true,
        mintAddress: mintResult.mintAddress,
        signature: mintResult.signature,
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

