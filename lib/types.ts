import { PublicKey } from '@solana/web3.js';

/**
 * Metadata de um ativo de pesquisa
 */
export interface ResearchAssetMetadata {
  /** Título do paper/protocolo/dataset */
  title: string;
  /** Lista de autores (public keys ou nomes) */
  authors: string[];
  /** Hash SHA-256 do arquivo para verificação de integridade */
  fileHash: string;
  /** URI do arquivo no Arweave */
  fileUri: string;
  /** Descrição do ativo */
  description?: string;
  /** Tags/categorias */
  tags?: string[];
  /** Data de criação */
  createdAt?: string;
  /** Data de atualização */
  updatedAt?: string;
  /** Versão do protocolo */
  version?: string;
}

/**
 * Metadata de um badge de revisor
 */
export interface ReviewerBadgeMetadata {
  /** Nível do revisor (1-5) */
  level: number;
  /** Score de reputação */
  score: number;
  /** Especialidades do revisor */
  specialties: string[];
  /** Data de emissão do badge */
  issuedAt: string;
  /** URI da imagem do badge */
  imageUri?: string;
  /** Descrição do badge */
  description?: string;
}

/**
 * Configuração do cofre de recompensas
 */
export interface TreasuryConfig {
  /** Mints de LST aceitos */
  acceptedLstMints: PublicKey[];
  /** Fee basis points para a tesouraria do protocolo */
  protocolFeeBasisPoints: number;
  /** Fee basis points para distribuição entre revisores */
  reviewerFeeBasisPoints: number;
  /** Endereço da autoridade do cofre */
  authority: PublicKey;
}

/**
 * Creator de royalties
 */
export interface Creator {
  /** Public key do criador */
  address: PublicKey;
  /** Percentual de royalties (basis points) */
  share: number;
  /** Se é verificado */
  verified: boolean;
}

/**
 * Configuração de royalties
 */
export interface RoyaltyConfig {
  /** Lista de criadores */
  creators: Creator[];
  /** Seller fee basis points (total) */
  sellerFeeBasisPoints: number;
}

/**
 * Configuração de mint de asset
 */
export interface AssetMintConfig {
  /** Metadata do asset */
  metadata: ResearchAssetMetadata;
  /** Configuração de royalties */
  royalties: RoyaltyConfig;
  /** Public key da coleção (opcional) */
  collection?: PublicKey;
  /** Autoridade de update */
  updateAuthority: PublicKey;
}

/**
 * Configuração de mint de badge SBT
 */
export interface BadgeMintConfig {
  /** Nome do badge */
  name: string;
  /** Símbolo do badge */
  symbol: string;
  /** URI da metadata */
  metadataUri: string;
  /** Autoridade de mint */
  mintAuthority: PublicKey;
  /** Autoridade de freeze (opcional) */
  freezeAuthority?: PublicKey;
}

/**
 * Configuração de pagamento para revisor
 */
export interface ReviewerPaymentConfig {
  /** Public key do revisor */
  reviewer: PublicKey;
  /** Quantidade a pagar */
  amount: number;
  /** Mint do token (LST) */
  mint: PublicKey;
  /** Nota/descrição do pagamento */
  note?: string;
}

/**
 * Resultado de uma operação de mint
 */
export interface MintResult {
  /** Public key do mint criado */
  mint: PublicKey;
  /** Public key da conta do token */
  tokenAccount?: PublicKey;
  /** Signature da transação */
  signature: string;
  /** URL do explorador */
  explorerUrl: string;
}

/**
 * Resultado de uma operação de PDA
 */
export interface PDAResult {
  /** Public key do PDA */
  address: PublicKey;
  /** Bump seed */
  bump: number;
  /** Seeds utilizados */
  seeds: Buffer[];
}

/**
 * Configuração de rede
 */
export interface NetworkConfig {
  /** Nome da rede */
  name: 'devnet' | 'mainnet-beta';
  /** URL do RPC */
  rpcUrl: string;
  /** Program IDs */
  programIds: {
    core: PublicKey;
    token2022: PublicKey;
    system: PublicKey;
    token: PublicKey;
  };
  /** LST mints disponíveis */
  lstMints: {
    mSOL: PublicKey;
    jitoSOL: PublicKey;
  };
}
