import { PublicKey } from '@solana/web3.js';
import { TREASURY_CONFIG } from './constants.js';

/**
 * Resultado de derivação de PDA
 */
export interface PDAResult {
  address: PublicKey;
  bump: number;
  seeds: Buffer[];
}

/**
 * Derivar PDA do cofre de recompensas
 * @param authority - Autoridade do cofre
 * @returns PDA do cofre
 */
export function deriveTreasuryVaultPDA(authority: PublicKey): PDAResult {
  const seeds = [
    Buffer.from(TREASURY_CONFIG.VAULT_SEED, 'utf8'),
    authority.toBuffer(),
  ];
  
  const [address, bump] = PublicKey.findProgramAddressSync(seeds, new PublicKey('11111111111111111111111111111111'));
  
  return {
    address,
    bump,
    seeds,
  };
}

/**
 * Derivar PDA para metadata de token
 * @param mint - Public key do mint
 * @param programId - Program ID (Token ou Token-2022)
 * @returns PDA da metadata
 */
export function deriveTokenMetadataPDA(mint: PublicKey, programId: PublicKey): PDAResult {
  const seeds = [
    Buffer.from('metadata', 'utf8'),
    programId.toBuffer(),
    mint.toBuffer(),
  ];
  
  const [address, bump] = PublicKey.findProgramAddressSync(seeds, new PublicKey('11111111111111111111111111111111'));
  
  return {
    address,
    bump,
    seeds,
  };
}

/**
 * Derivar PDA para Core Asset
 * @param mint - Public key do mint
 * @param programId - Program ID do Core
 * @returns PDA do asset
 */
export function deriveCoreAssetPDA(mint: PublicKey, programId: PublicKey): PDAResult {
  const seeds = [
    Buffer.from('asset', 'utf8'),
    programId.toBuffer(),
    mint.toBuffer(),
  ];
  
  const [address, bump] = PublicKey.findProgramAddressSync(seeds, programId);
  
  return {
    address,
    bump,
    seeds,
  };
}

/**
 * Derivar PDA para Core Collection
 * @param mint - Public key do mint da coleção
 * @param programId - Program ID do Core
 * @returns PDA da coleção
 */
export function deriveCoreCollectionPDA(mint: PublicKey, programId: PublicKey): PDAResult {
  const seeds = [
    Buffer.from('collection', 'utf8'),
    programId.toBuffer(),
    mint.toBuffer(),
  ];
  
  const [address, bump] = PublicKey.findProgramAddressSync(seeds, programId);
  
  return {
    address,
    bump,
    seeds,
  };
}

/**
 * Derivar PDA para ATA (Associated Token Account)
 * @param owner - Owner da conta
 * @param mint - Public key do mint
 * @param programId - Program ID (Token ou Token-2022)
 * @returns PDA da ATA
 */
export function deriveATAPDA(owner: PublicKey, mint: PublicKey, programId: PublicKey): PDAResult {
  const seeds = [
    owner.toBuffer(),
    programId.toBuffer(),
    mint.toBuffer(),
  ];
  
  const [address, bump] = PublicKey.findProgramAddressSync(seeds, new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'));
  
  return {
    address,
    bump,
    seeds,
  };
}

/**
 * Verificar se um PDA é válido
 * @param address - Endereço a verificar
 * @param seeds - Seeds utilizados
 * @param programId - Program ID
 * @returns True se o PDA é válido
 */
export function isValidPDA(address: PublicKey, seeds: Buffer[], programId: PublicKey): boolean {
  try {
    const [derivedAddress] = PublicKey.findProgramAddressSync(seeds, programId);
    return derivedAddress.equals(address);
  } catch {
    return false;
  }
}

/**
 * Derivar PDA genérico com seeds customizados
 * @param seeds - Array de seeds
 * @param programId - Program ID
 * @returns PDA resultante
 */
export function deriveCustomPDA(seeds: Buffer[], programId: PublicKey): PDAResult {
  const [address, bump] = PublicKey.findProgramAddressSync(seeds, programId);
  
  return {
    address,
    bump,
    seeds,
  };
}
