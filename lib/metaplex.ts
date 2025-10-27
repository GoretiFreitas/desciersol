/**
 * Metaplex SDK Integration
 * Helpers para criar NFTs, coleções e gerenciar metadata
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity, toMetaplexFile } from '@metaplex-foundation/js';
import { createConnection } from './connection.js';
import { loadKeypair } from './keypair.js';

/**
 * Criar instância do Metaplex
 */
export function createMetaplex(connection?: Connection, payer?: Keypair): Metaplex {
  const conn = connection || createConnection();
  const kp = payer || loadKeypair();
  
  const metaplex = Metaplex.make(conn)
    .use(keypairIdentity(kp));
  
  return metaplex;
}

/**
 * Criar instância do Metaplex com storage customizado
 * NOTA: Para upload real Arweave, configurar storage driver
 */
export function createMetaplexWithStorage(connection?: Connection, payer?: Keypair): Metaplex {
  const conn = connection || createConnection();
  const kp = payer || loadKeypair();
  
  // Para produção, adicionar storage driver aqui
  const metaplex = Metaplex.make(conn)
    .use(keypairIdentity(kp));
  
  return metaplex;
}

/**
 * Interface para metadata de NFT (padrão Metaplex)
 */
export interface MetaplexNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
      hash?: string;
    }>;
    category?: string;
    creators?: Array<{
      address: string;
      share: number;
      verified?: boolean;
    }>;
  };
  [key: string]: unknown;
}

/**
 * Interface para configuração de criação de NFT
 */
export interface CreateNFTConfig {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators?: Array<{
    address: PublicKey;
    share: number;
  }>;
  collection?: PublicKey;
  collectionAuthority?: Keypair;
  isMutable?: boolean;
  maxSupply?: number;
}

/**
 * Interface para configuração de criação de coleção
 */
export interface CreateCollectionConfig {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints?: number;
  creators?: Array<{
    address: PublicKey;
    share: number;
  }>;
  isMutable?: boolean;
  maxSupply?: number;
}

/**
 * Criar coleção NFT
 */
export async function createCollection(
  metaplex: Metaplex,
  config: CreateCollectionConfig
) {
  console.log('🎨 Criando coleção NFT com Metaplex...');
  
  const { nft: collectionNFT } = await metaplex.nfts().create({
    uri: config.uri,
    name: config.name,
    symbol: config.symbol,
    sellerFeeBasisPoints: config.sellerFeeBasisPoints || 0,
    isCollection: true,
    creators: config.creators,
    isMutable: config.isMutable !== false,
    maxSupply: config.maxSupply,
  });
  
  console.log('✅ Coleção criada!');
  console.log(`   Mint: ${collectionNFT.address.toString()}`);
  console.log(`   Metadata: ${collectionNFT.metadataAddress.toString()}`);
  
  return collectionNFT;
}

/**
 * Criar NFT individual
 */
export async function createNFT(
  metaplex: Metaplex,
  config: CreateNFTConfig
) {
  console.log('🎨 Mintando NFT com Metaplex...');
  
  const { nft } = await metaplex.nfts().create({
    uri: config.uri,
    name: config.name,
    symbol: config.symbol,
    sellerFeeBasisPoints: config.sellerFeeBasisPoints,
    creators: config.creators,
    isMutable: config.isMutable !== false,
    maxSupply: config.maxSupply,
    collection: config.collection,
  });
  
  console.log('✅ NFT criado!');
  console.log(`   Mint: ${nft.address.toString()}`);
  console.log(`   Metadata: ${nft.metadataAddress.toString()}`);
  
  // Verificar coleção se especificada
  if (config.collection && config.collectionAuthority) {
    console.log('🔍 Verificando coleção...');
    await metaplex.nfts().verifyCollection({
      mintAddress: nft.address,
      collectionMintAddress: config.collection,
      collectionAuthority: config.collectionAuthority,
    });
    console.log('✅ Coleção verificada!');
  }
  
  return nft;
}

/**
 * Atualizar NFT
 */
export async function updateNFT(
  metaplex: Metaplex,
  mintAddress: PublicKey,
  updateAuthority: Keypair,
  newUri?: string,
  newName?: string,
  newSymbol?: string
) {
  console.log('🔄 Atualizando NFT...');
  
  const nft = await metaplex.nfts().findByMint({ mintAddress });
  
  await metaplex.nfts().update({
    nftOrSft: nft,
    uri: newUri,
    name: newName,
    symbol: newSymbol,
    updateAuthority,
  });
  
  console.log('✅ NFT atualizado!');
  
  return nft;
}

/**
 * Upload de metadata para Arweave via Metaplex
 */
export async function uploadMetadata(
  metaplex: Metaplex,
  metadata: MetaplexNFTMetadata
): Promise<string> {
  console.log('📤 Uploading metadata via Metaplex...');
  
  const { uri } = await metaplex.nfts().uploadMetadata(metadata);
  
  console.log(`✅ Metadata uploaded: ${uri}`);
  
  return uri;
}

/**
 * Obter NFT por mint address
 */
export async function getNFT(metaplex: Metaplex, mintAddress: PublicKey) {
  return await metaplex.nfts().findByMint({ mintAddress });
}

/**
 * Obter todos os NFTs de uma wallet
 */
export async function getNFTsByOwner(metaplex: Metaplex, owner: PublicKey) {
  return await metaplex.nfts().findAllByOwner({ owner });
}

/**
 * Verificar se NFT pertence a uma coleção
 */
export async function verifyCollectionItem(
  metaplex: Metaplex,
  nftMintAddress: PublicKey,
  collectionMintAddress: PublicKey,
  collectionAuthority: Keypair
) {
  console.log('🔍 Verificando NFT na coleção...');
  
  await metaplex.nfts().verifyCollection({
    mintAddress: nftMintAddress,
    collectionMintAddress,
    collectionAuthority,
  });
  
  console.log('✅ NFT verificado na coleção!');
}

/**
 * Remover verificação de NFT de uma coleção
 */
export async function unverifyCollectionItem(
  metaplex: Metaplex,
  nftMintAddress: PublicKey,
  collectionMintAddress: PublicKey,
  collectionAuthority: Keypair
) {
  console.log('❌ Removendo verificação da coleção...');
  
  await metaplex.nfts().unverifyCollection({
    mintAddress: nftMintAddress,
    collectionMintAddress,
    collectionAuthority,
  });
  
  console.log('✅ Verificação removida!');
}
