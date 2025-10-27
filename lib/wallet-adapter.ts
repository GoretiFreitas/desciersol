/**
 * Wallet Adapter para integração com Solflare e outras wallets
 */

import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

/**
 * Interface para wallet adapter
 */
export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}

/**
 * Configuração de wallets suportadas
 */
export const SUPPORTED_WALLETS = {
  solflare: {
    name: 'Solflare',
    url: 'https://solflare.com',
    icon: 'https://solflare.com/favicon.ico',
    adapter: 'window.solflare'
  },
  phantom: {
    name: 'Phantom',
    url: 'https://phantom.app',
    icon: 'https://phantom.app/img/logo.png',
    adapter: 'window.phantom?.solana'
  },
  backpack: {
    name: 'Backpack',
    url: 'https://backpack.app',
    icon: 'https://backpack.app/favicon.ico',
    adapter: 'window.backpack'
  }
};

/**
 * Detectar wallets disponíveis no browser
 */
export function detectAvailableWallets(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const available: string[] = [];

  // Detectar Solflare
  if ((window as any).solflare) {
    available.push('solflare');
  }

  // Detectar Phantom
  if ((window as any).phantom?.solana) {
    available.push('phantom');
  }

  // Detectar Backpack
  if ((window as any).backpack) {
    available.push('backpack');
  }

  return available;
}

/**
 * Conectar com Solflare wallet
 */
export async function connectSolflare(): Promise<PublicKey | null> {
  if (typeof window === 'undefined') {
    throw new Error('Window não disponível. Use em ambiente browser.');
  }

  const solflare = (window as any).solflare;
  
  if (!solflare) {
    throw new Error('Solflare wallet não detectada. Instale a extensão: https://solflare.com');
  }

  try {
    const response = await solflare.connect();
    console.log('✅ Conectado à Solflare:', response.publicKey.toString());
    return response.publicKey;
  } catch (error) {
    console.error('❌ Erro ao conectar com Solflare:', error);
    throw error;
  }
}

/**
 * Desconectar wallet
 */
export async function disconnectWallet(walletType: string = 'solflare'): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const wallet = (window as any)[walletType];
  
  if (wallet?.disconnect) {
    await wallet.disconnect();
    console.log('✅ Desconectado da wallet');
  }
}

/**
 * Obter wallet adapter baseado no tipo
 */
export function getWalletAdapter(walletType: string = 'solflare'): WalletAdapter | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const wallet = (window as any)[walletType];
  
  if (!wallet) {
    return null;
  }

  return {
    publicKey: wallet.publicKey || null,
    connected: wallet.isConnected || false,
    connect: async () => {
      await wallet.connect();
    },
    disconnect: async () => {
      await wallet.disconnect();
    },
    signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => {
      return await wallet.signTransaction(transaction);
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> => {
      return await wallet.signAllTransactions(transactions);
    },
    signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
      return await wallet.signMessage(message);
    }
  };
}

/**
 * Verificar se wallet está conectada
 */
export function isWalletConnected(walletType: string = 'solflare'): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const wallet = (window as any)[walletType];
  return wallet?.isConnected || false;
}

/**
 * Obter public key da wallet conectada
 */
export function getWalletPublicKey(walletType: string = 'solflare'): PublicKey | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const wallet = (window as any)[walletType];
  return wallet?.publicKey || null;
}
