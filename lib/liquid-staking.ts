/**
 * Liquid Staking Integration
 * Suporte para mSOL (Marinade), jitoSOL (Jito) e outros LSTs
 */

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import { getCurrentNetworkConfig } from './constants.js';

/**
 * Informações sobre LSTs suportados
 */
export interface LSTInfo {
  name: string;
  symbol: string;
  mint: PublicKey;
  decimals: number;
  protocol: string;
  website: string;
  apy: number; // APY estimado
  tvl: number; // TVL em SOL
}

/**
 * Configuração de LSTs por rede
 */
export const LST_CONFIG = {
  mainnet: {
    mSOL: {
      name: 'Marinade Staked SOL',
      symbol: 'mSOL',
      mint: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
      decimals: 9,
      protocol: 'Marinade Finance',
      website: 'https://marinade.finance',
      apy: 7.5,
      tvl: 8500000 // ~8.5M SOL
    },
    jitoSOL: {
      name: 'Jito Staked SOL',
      symbol: 'jitoSOL',
      mint: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
      decimals: 9,
      protocol: 'Jito',
      website: 'https://jito.network',
      apy: 8.2,
      tvl: 12000000 // ~12M SOL
    },
    bSOL: {
      name: 'BlazeStake Staked SOL',
      symbol: 'bSOL',
      mint: new PublicKey('bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1'),
      decimals: 9,
      protocol: 'BlazeStake',
      website: 'https://blazestake.com',
      apy: 7.8,
      tvl: 1500000 // ~1.5M SOL
    }
  },
  devnet: {
    mSOL: {
      name: 'Marinade Staked SOL (Devnet)',
      symbol: 'mSOL',
      mint: new PublicKey('So11111111111111111111111111111111111111112'),
      decimals: 9,
      protocol: 'Marinade Finance',
      website: 'https://marinade.finance',
      apy: 7.5,
      tvl: 0
    },
    jitoSOL: {
      name: 'Jito Staked SOL (Devnet)',
      symbol: 'jitoSOL',
      mint: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
      decimals: 9,
      protocol: 'Jito',
      website: 'https://jito.network',
      apy: 8.2,
      tvl: 0
    }
  }
};

/**
 * Obter informações sobre um LST
 */
export function getLSTInfo(symbol: string, network: 'mainnet' | 'devnet' = 'devnet'): LSTInfo | null {
  const config = LST_CONFIG[network];
  return config[symbol as keyof typeof config] || null;
}

/**
 * Listar todos os LSTs disponíveis
 */
export function getAllLSTs(network: 'mainnet' | 'devnet' = 'devnet'): LSTInfo[] {
  const config = LST_CONFIG[network];
  return Object.values(config);
}

/**
 * Calcular yield estimado
 */
export function calculateYield(amount: number, lstSymbol: string, days: number = 365): number {
  const networkConfig = getCurrentNetworkConfig();
  const network = networkConfig.name === 'mainnet-beta' ? 'mainnet' : 'devnet';
  const lstInfo = getLSTInfo(lstSymbol, network);
  
  if (!lstInfo) {
    return 0;
  }

  const dailyRate = lstInfo.apy / 365 / 100;
  const yield_ = amount * dailyRate * days;
  
  return yield_;
}

/**
 * Obter taxa de conversão SOL → LST
 * @param lstSymbol - Símbolo do LST (mSOL, jitoSOL, etc.)
 * @returns Taxa de conversão (exemplo: 1 SOL = 0.98 mSOL)
 */
export async function getConversionRate(
  connection: Connection,
  lstSymbol: string
): Promise<number> {
  // TODO: Implementar chamada real às APIs dos protocolos
  // Por enquanto, retornar taxas estimadas
  
  const rates: Record<string, number> = {
    mSOL: 1.02,    // 1 SOL = 1.02 mSOL
    jitoSOL: 1.01, // 1 SOL = 1.01 jitoSOL
    bSOL: 1.015    // 1 SOL = 1.015 bSOL
  };
  
  return rates[lstSymbol] || 1.0;
}

/**
 * Estimar quanto SOL é necessário para comprar X LST
 */
export async function estimateSOLForLST(
  connection: Connection,
  lstSymbol: string,
  lstAmount: number
): Promise<number> {
  const rate = await getConversionRate(connection, lstSymbol);
  return lstAmount / rate;
}

/**
 * Estimar quanto LST será recebido por X SOL
 */
export async function estimateLSTForSOL(
  connection: Connection,
  lstSymbol: string,
  solAmount: number
): Promise<number> {
  const rate = await getConversionRate(connection, lstSymbol);
  return solAmount * rate;
}

/**
 * Verificar se usuário possui LST
 */
export async function hasLST(
  connection: Connection,
  owner: PublicKey,
  lstSymbol: string
): Promise<boolean> {
  const networkConfig = getCurrentNetworkConfig();
  const network = networkConfig.name === 'mainnet-beta' ? 'mainnet' : 'devnet';
  const lstInfo = getLSTInfo(lstSymbol, network);
  
  if (!lstInfo) {
    return false;
  }

  try {
    const ata = await getAssociatedTokenAddress(lstInfo.mint, owner);
    const account = await connection.getAccountInfo(ata);
    return account !== null;
  } catch {
    return false;
  }
}

/**
 * Obter saldo de LST
 */
export async function getLSTBalance(
  connection: Connection,
  owner: PublicKey,
  lstSymbol: string
): Promise<number> {
  const networkConfig = getCurrentNetworkConfig();
  const network = networkConfig.name === 'mainnet-beta' ? 'mainnet' : 'devnet';
  const lstInfo = getLSTInfo(lstSymbol, network);
  
  if (!lstInfo) {
    return 0;
  }

  try {
    const ata = await getAssociatedTokenAddress(lstInfo.mint, owner);
    const balance = await connection.getTokenAccountBalance(ata);
    return parseFloat(balance.value.amount) / Math.pow(10, lstInfo.decimals);
  } catch {
    return 0;
  }
}

/**
 * Calcular rewards acumulados (estimativa)
 */
export function calculateRewards(
  principal: number,
  lstSymbol: string,
  daysStaked: number
): number {
  return calculateYield(principal, lstSymbol, daysStaked);
}

/**
 * Comparar LSTs
 */
export function compareLSTs(network: 'mainnet' | 'devnet' = 'mainnet'): {
  symbol: string;
  apy: number;
  tvl: number;
  protocol: string;
}[] {
  const lsts = getAllLSTs(network);
  return lsts
    .map(lst => ({
      symbol: lst.symbol,
      apy: lst.apy,
      tvl: lst.tvl,
      protocol: lst.protocol
    }))
    .sort((a, b) => b.apy - a.apy); // Ordenar por APY descendente
}
