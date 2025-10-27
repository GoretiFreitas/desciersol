import { PublicKey } from '@solana/web3.js';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

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

