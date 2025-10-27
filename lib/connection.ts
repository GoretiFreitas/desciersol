import { Connection, PublicKey } from '@solana/web3.js';
import { config } from 'dotenv';
import { getCurrentNetworkConfig, getExplorerUrl } from './constants.js';

// Carregar variáveis de ambiente
config();

/**
 * Cliente de conexão com a rede Solana
 */
export function createConnection(): Connection {
  const rpcUrl = process.env.RPC_URL || 'https://api.devnet.solana.com';
  
  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

/**
 * Obter o network atual
 */
export function getNetwork(): 'devnet' | 'mainnet-beta' {
  return (process.env.NETWORK as 'devnet' | 'mainnet-beta') || 'devnet';
}

/**
 * Verificar se uma conta existe
 */
export async function accountExists(
  connection: Connection,
  publicKey: PublicKey
): Promise<boolean> {
  try {
    const accountInfo = await connection.getAccountInfo(publicKey);
    return accountInfo !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Obter o saldo de uma conta
 */
export async function getAccountBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Converter lamports para SOL
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    return 0;
  }
}

// Re-exportar funções de constants.js
export { getCurrentNetworkConfig, getExplorerUrl };
