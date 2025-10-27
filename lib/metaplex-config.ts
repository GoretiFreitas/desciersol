/**
 * Configurações específicas do Metaplex
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Program IDs do Metaplex
 */
export const METAPLEX_PROGRAM_IDS = {
  TOKEN_METADATA: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
  AUCTION_HOUSE: new PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk'),
  CANDY_MACHINE_V3: new PublicKey('CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR'),
};

/**
 * Configuração padrão para NFTs de pesquisa
 */
export const RESEARCH_NFT_DEFAULTS = {
  symbol: 'RA', // Research Asset
  sellerFeeBasisPoints: 500, // 5%
  isMutable: true,
  category: 'document',
  external_url: 'https://research-assets.io',
};

/**
 * Configuração padrão para coleções
 */
export const COLLECTION_DEFAULTS = {
  symbol: 'RAC', // Research Assets Collection
  sellerFeeBasisPoints: 0, // Coleções geralmente não têm royalties
  isMutable: true,
  category: 'image',
};

/**
 * Configuração de Bundlr/Irys para Arweave
 */
export const BUNDLR_CONFIG = {
  devnet: {
    address: 'https://devnet.bundlr.network',
    currency: 'solana',
    timeout: 60000,
  },
  mainnet: {
    address: 'https://node1.bundlr.network',
    currency: 'solana',
    timeout: 60000,
  },
};

/**
 * Limites de metadata
 */
export const METADATA_LIMITS = {
  name: 32,
  symbol: 10,
  uri: 200,
  creators: 5,
};

/**
 * Trait types comuns para ativos de pesquisa
 */
export const RESEARCH_TRAIT_TYPES = {
  FILE_HASH: 'File Hash',
  AUTHORS: 'Authors',
  VERSION: 'Version',
  PUBLICATION_DATE: 'Publication Date',
  DOI: 'DOI',
  LICENSE: 'License',
  CATEGORY: 'Category',
  PEER_REVIEWED: 'Peer Reviewed',
  CITATIONS: 'Citations',
};

/**
 * Categorias de ativos de pesquisa
 */
export const RESEARCH_CATEGORIES = {
  PAPER: 'Research Paper',
  DATASET: 'Dataset',
  PROTOCOL: 'Protocol',
  CODE: 'Code Repository',
  PRESENTATION: 'Presentation',
  THESIS: 'Thesis',
  REVIEW: 'Review Article',
};

/**
 * Validar configuração de creators
 */
export function validateCreators(creators: Array<{ address: PublicKey; share: number }>): boolean {
  if (creators.length === 0) {
    throw new Error('Pelo menos um creator é necessário');
  }
  
  if (creators.length > METADATA_LIMITS.creators) {
    throw new Error(`Máximo de ${METADATA_LIMITS.creators} creators permitidos`);
  }
  
  const totalShare = creators.reduce((sum, creator) => sum + creator.share, 0);
  if (totalShare !== 100) {
    throw new Error(`Shares dos creators devem somar 100. Atual: ${totalShare}`);
  }
  
  return true;
}

/**
 * Validar seller fee basis points
 */
export function validateSellerFee(basisPoints: number): boolean {
  if (basisPoints < 0 || basisPoints > 10000) {
    throw new Error('Seller fee deve estar entre 0 e 10000 basis points (0-100%)');
  }
  
  return true;
}
