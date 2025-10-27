import { PublicKey } from '@solana/web3.js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

/**
 * Configurações da rede
 */
export const NETWORK_CONFIG = {
  devnet: {
    name: 'devnet' as const,
    rpcUrl: process.env.RPC_URL || 'https://api.devnet.solana.com',
    programIds: {
      core: new PublicKey(process.env.CORE_PROGRAM_ID || 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'),
      token2022: new PublicKey(process.env.TOKEN_2022_PROGRAM_ID || 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
      system: new PublicKey('11111111111111111111111111111111'),
      token: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    },
    lstMints: {
      mSOL: new PublicKey(process.env.MSOL_MINT || 'So11111111111111111111111111111111111111112'),
      jitoSOL: new PublicKey(process.env.JITOSOL_MINT || 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
    },
  },
  'mainnet-beta': {
    name: 'mainnet-beta' as const,
    rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
    programIds: {
      core: new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'),
      token2022: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
      system: new PublicKey('11111111111111111111111111111111'),
      token: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    },
    lstMints: {
      mSOL: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
      jitoSOL: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
    },
  },
};

/**
 * Obter configuração da rede atual
 */
export function getCurrentNetworkConfig() {
  const network = (process.env.NETWORK as 'devnet' | 'mainnet-beta') || 'devnet';
  return NETWORK_CONFIG[network];
}

/**
 * Constantes de royalties
 */
export const ROYALTY_CONFIG = {
  /** Fee basis points padrão (5%) */
  DEFAULT_SELLER_FEE_BASIS_POINTS: parseInt(process.env.DEFAULT_ROYALTY_BASIS_POINTS || '500'),
  /** Fee máximo permitido (10%) */
  MAX_SELLER_FEE_BASIS_POINTS: 1000,
  /** Fee mínimo (0%) */
  MIN_SELLER_FEE_BASIS_POINTS: 0,
};

/**
 * Constantes do cofre
 */
export const TREASURY_CONFIG = {
  /** Seed para derivação do PDA do cofre */
  VAULT_SEED: process.env.TREASURY_SEED || 'treasury_vault',
  /** Fee basis points para a tesouraria do protocolo (2%) */
  PROTOCOL_FEE_BASIS_POINTS: 200,
  /** Fee basis points para distribuição entre revisores (3%) */
  REVIEWER_FEE_BASIS_POINTS: 300,
};

/**
 * Constantes de SBT (Soulbound Token)
 */
export const SBT_CONFIG = {
  /** Decimals para SBTs (sempre 0) */
  DECIMALS: 0,
  /** Supply inicial para SBTs (0, será mintado conforme necessário) */
  INITIAL_SUPPLY: 0,
  /** Extensões obrigatórias para SBTs */
  REQUIRED_EXTENSIONS: ['NonTransferable', 'MetadataPointer'],
};

/**
 * Constantes de metadata
 */
export const METADATA_CONFIG = {
  /** Nome da coleção de ativos de pesquisa */
  COLLECTION_NAME: 'Research Assets Collection',
  /** Símbolo da coleção */
  COLLECTION_SYMBOL: 'RAC',
  /** Descrição da coleção */
  COLLECTION_DESCRIPTION: 'Coleção de ativos de pesquisa científica na Solana',
  /** URI da imagem da coleção */
  COLLECTION_IMAGE_URI: 'https://arweave.net/collection-image-placeholder',
  /** Nome do badge de revisor */
  BADGE_NAME: 'Research Reviewer Badge',
  /** Símbolo do badge */
  BADGE_SYMBOL: 'RRB',
  /** Descrição do badge */
  BADGE_DESCRIPTION: 'Badge de revisor de ativos de pesquisa científica',
};

/**
 * Constantes de transação
 */
export const TRANSACTION_CONFIG = {
  /** Timeout para confirmação de transação (60s) */
  CONFIRMATION_TIMEOUT: 60000,
  /** Commitment level */
  COMMITMENT: 'confirmed' as const,
  /** Número máximo de tentativas de retry */
  MAX_RETRIES: 3,
  /** Delay entre tentativas (ms) */
  RETRY_DELAY: 1000,
};

/**
 * Constantes de Arweave
 */
export const ARWEAVE_CONFIG = {
  /** Gateway do Arweave */
  GATEWAY_URL: process.env.ARWEAVE_GATEWAY || 'https://arweave.net',
  /** Tags padrão para uploads */
  DEFAULT_TAGS: {
    'Content-Type': 'application/json',
    'App-Name': 'Solana Research Assets',
    'App-Version': '1.0.0',
  },
};

/**
 * Constantes de validação
 */
export const VALIDATION_CONFIG = {
  /** Tamanho máximo do título (caracteres) */
  MAX_TITLE_LENGTH: 100,
  /** Tamanho máximo da descrição (caracteres) */
  MAX_DESCRIPTION_LENGTH: 1000,
  /** Número máximo de autores */
  MAX_AUTHORS: 10,
  /** Número máximo de tags */
  MAX_TAGS: 20,
  /** Tamanho máximo de cada tag (caracteres) */
  MAX_TAG_LENGTH: 50,
};

/**
 * URLs de exploradores
 */
export const EXPLORER_URLS = {
  devnet: 'https://explorer.solana.com/tx',
  'mainnet-beta': 'https://explorer.solana.com/tx',
};

/**
 * Obter URL do explorador para uma transação
 */
export function getExplorerUrl(signature: string, network?: 'devnet' | 'mainnet-beta'): string {
  const currentNetwork = network || (process.env.NETWORK as 'devnet' | 'mainnet-beta') || 'devnet';
  const baseUrl = EXPLORER_URLS[currentNetwork];
  return `${baseUrl}/${signature}?cluster=${currentNetwork}`;
}
