'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface StakeSOLParams {
  amount: number; // Amount in SOL
}

interface StakeSOLResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export function useStakeSOL() {
  const { connection: defaultConnection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stakeSOL = async (params: StakeSOLParams): Promise<StakeSOLResult> => {
    try {
      setLoading(true);
      setError(null);

      if (!wallet.connected || !wallet.publicKey) {
        throw new Error('Wallet não conectada');
      }

      if (!wallet.signTransaction) {
        throw new Error('Wallet não suporta assinatura de transações');
      }

      console.log('💰 Iniciando stake real de SOL...');
      console.log('📋 Amount:', params.amount, 'SOL');

      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const connection = new Connection(rpcUrl, {
        commitment: 'confirmed'
      });

      // Treasury vault address
      const vaultAddress = new PublicKey(
        process.env.NEXT_PUBLIC_VAULT_ADDRESS || 'Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6'
      );

      console.log('🔑 Reviewer wallet:', wallet.publicKey.toString());
      console.log('🏦 Vault address:', vaultAddress.toString());

      // Convert amount to lamports
      const amountLamports = Math.floor(params.amount * LAMPORTS_PER_SOL);
      console.log('💸 Amount in lamports:', amountLamports);

      // Create SOL transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: vaultAddress,
        lamports: amountLamports,
      });

      // Create transaction
      const transaction = new Transaction().add(transferInstruction);
      
      // Get latest blockhash
      console.log('🔄 Getting latest blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      console.log('📋 Blockhash:', blockhash);

      // Sign transaction
      console.log('✍️ Solicitando assinatura...');
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send transaction
      console.log('📡 Enviando transação...');
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      console.log('⏳ Confirmando transação...');
      console.log('📝 Signature:', signature);
      
      // Confirm transaction
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      console.log('✅ SOL staked on-chain!');
      console.log('📝 Signature:', signature);
      console.log('🔍 Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      // Register stake in backend
      await fetch('/api/treasury/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerWallet: wallet.publicKey.toString(),
          lstMint: 'SOL',
          amount: params.amount,
          transactionSignature: signature,
        }),
      });

      return {
        success: true,
        signature,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao fazer stake:', errorMessage);
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
    stakeSOL,
    loading,
    error,
  };
}

