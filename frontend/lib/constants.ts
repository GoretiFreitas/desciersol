import { PublicKey } from '@solana/web3.js';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Collection NFT address
export const COLLECTION_ADDRESS = new PublicKey(
  process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || 
  'HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6'
);

export const EXPLORER_URL = 
  NETWORK === 'mainnet-beta' 
    ? 'https://explorer.solana.com'
    : 'https://explorer.solana.com?cluster=devnet';

export const BRAND = {
  name: 'deScier',
  tagline: 'Empowering science through decentralization',
  description: 'Open peer review platform powered by Solana blockchain',
};

// Review System Constants
export const REVIEW_TRAIT_TYPE = 'Review';
export const BADGE_COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS || 'TBD'; // Criar collection para badges
export const MAX_REVIEWS_PER_PAPER = 50; // Limite de atributos

