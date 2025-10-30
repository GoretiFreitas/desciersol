'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token';

interface StakeLSTParams {
  lstMint: string;
  amount: number;
}

interface StakeLSTResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export function useStakeLST() {
  const { connection: defaultConnection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stakeLST = async (params: StakeLSTParams): Promise<StakeLSTResult> => {
    try {
      setLoading(true);
      setError(null);

      if (!wallet.connected || !wallet.publicKey) {
        throw new Error('Wallet não conectada');
      }

      if (!wallet.signTransaction) {
        throw new Error('Wallet não suporta assinatura de transações');
      }

      console.log('💰 Iniciando stake real de LST...');
      console.log('📋 LST Mint:', params.lstMint);
      console.log('📋 Amount:', params.amount);

      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
        { commitment: 'confirmed' }
      );

      // Treasury vault address (use environment variable)
      const vaultAddress = new PublicKey(
        process.env.NEXT_PUBLIC_VAULT_ADDRESS || 'H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S'
      );
      const lstMintPubkey = new PublicKey(params.lstMint);

      console.log('🔑 Reviewer wallet:', wallet.publicKey.toString());
      console.log('🏦 Vault address:', vaultAddress.toString());
      console.log('🪙 LST Mint:', lstMintPubkey.toString());

      // Get token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(
        lstMintPubkey,
        wallet.publicKey
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        lstMintPubkey,
        vaultAddress
      );

      console.log('📤 From (Reviewer ATA):', fromTokenAccount.toString());
      console.log('📥 To (Vault ATA):', toTokenAccount.toString());

      if (fromTokenAccount.equals(toTokenAccount)) {
        throw new Error('From and To token accounts are the same! Check wallet addresses.');
      }

      // Check if vault's ATA exists, create if not
      console.log('🔍 Checking if vault ATA exists...');
      let needsCreateATA = false;
      
      try {
        await getAccount(connection, toTokenAccount);
        console.log('✅ Vault ATA exists');
      } catch (error) {
        console.log('⚠️ Vault ATA does not exist, will create it');
        needsCreateATA = true;
      }

      // Convert amount to lamports (assuming 9 decimals for LST)
      const amountLamports = Math.floor(params.amount * Math.pow(10, 9));

      console.log('💸 Transfer amount:', params.amount, 'LST');
      console.log('💸 Amount in lamports:', amountLamports);

      // Build transaction instructions
      const instructions = [];

      // Add create ATA instruction if needed
      if (needsCreateATA) {
        console.log('➕ Adding create ATA instruction...');
        instructions.push(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey, // payer
            toTokenAccount, // ata
            vaultAddress, // owner
            lstMintPubkey, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction
      instructions.push(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          wallet.publicKey,
          amountLamports,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Create transaction with all instructions
      const transaction = new Transaction().add(...instructions);
      
      // Get latest blockhash right before signing
      console.log('🔄 Getting latest blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      console.log('📋 Blockhash:', blockhash);
      console.log('📋 Last valid block height:', lastValidBlockHeight);

      // Sign transaction
      console.log('✍️ Solicitando assinatura...');
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send transaction immediately after signing
      console.log('📡 Enviando transação...');
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      console.log('⏳ Confirmando transação...');
      console.log('📝 Signature:', signature);
      
      // Confirm with blockhash info
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log('✅ LST staked on-chain!');
      console.log('📝 Signature:', signature);

      // Register stake in backend
      await fetch('/api/treasury/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerWallet: wallet.publicKey.toString(),
          lstMint: params.lstMint,
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
    stakeLST,
    loading,
    error,
  };
}

