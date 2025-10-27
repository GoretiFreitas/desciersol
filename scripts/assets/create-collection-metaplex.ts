#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  METADATA_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';
import { 
  createMetaplex, 
  createCollection,
  MetaplexNFTMetadata 
} from '../../lib/metaplex.js';
import { 
  COLLECTION_DEFAULTS,
  RESEARCH_TRAIT_TYPES 
} from '../../lib/metaplex-config.js';

const program = new Command();

program
  .name('create-collection-metaplex')
  .description('Criar coleção NFT usando Metaplex SDK')
  .option('-n, --name <name>', 'Nome da coleção', METADATA_CONFIG.COLLECTION_NAME)
  .option('-s, --symbol <symbol>', 'Símbolo da coleção', COLLECTION_DEFAULTS.symbol)
  .option('-d, --description <description>', 'Descrição da coleção', METADATA_CONFIG.COLLECTION_DESCRIPTION)
  .option('-i, --image-uri <uri>', 'URI da imagem da coleção', METADATA_CONFIG.COLLECTION_IMAGE_URI)
  .option('--external-url <url>', 'URL externa da coleção', 'https://research-assets.io')
  .option('--max-supply <number>', 'Supply máximo da coleção')
  .option('--immutable', 'Tornar coleção imutável')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando criação da coleção NFT (Metaplex)...');
      console.log('📋 Configuração:');
      console.log(`   Nome: ${options.name}`);
      console.log(`   Símbolo: ${options.symbol}`);
      console.log(`   Descrição: ${options.description}`);
      console.log(`   Imagem: ${options.imageUri}`);
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      console.log(`🌐 Rede: ${networkConfig.name}`);
      console.log(`👤 Autoridade: ${keypair.publicKey.toString()}`);
      
      // Verificar saldo
      const balance = await connection.getBalance(keypair.publicKey);
      const balanceSOL = balance / 1e9;
      console.log(`💰 Saldo: ${balanceSOL.toFixed(4)} SOL`);
      
      if (balanceSOL < 0.1) {
        console.warn('⚠️  Saldo baixo! Recomendado pelo menos 0.1 SOL para criar NFTs.');
      }
      
      // Criar metadata da coleção (padrão Metaplex)
      const collectionMetadata: MetaplexNFTMetadata = {
        name: options.name,
        symbol: options.symbol,
        description: options.description,
        image: options.imageUri,
        external_url: options.externalUrl || 'https://research-assets.io',
        attributes: [
          {
            trait_type: 'Collection Type',
            value: 'Research Assets'
          },
          {
            trait_type: 'Protocol',
            value: 'SurgPass'
          },
          {
            trait_type: 'Network',
            value: networkConfig.name
          }
        ],
        properties: {
          files: [
            {
              uri: options.imageUri,
              type: 'image/png'
            }
          ],
          category: 'image',
          creators: [
            {
              address: keypair.publicKey.toString(),
              share: 100,
              verified: true
            }
          ]
        }
      };
      
      console.log('📤 Uploading metadata para Arweave...');
      const metadataResult = await uploadMetadataToArweave(collectionMetadata);
      console.log(`✅ Metadata URI: ${metadataResult.url}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`📄 Metadata seria criada em: ${metadataResult.url}`);
        console.log(`🎯 Coleção seria criada com Metaplex SDK`);
        return;
      }
      
      // Criar instância do Metaplex
      const metaplex = createMetaplex(connection, keypair);
      
      // Criar coleção NFT
      const collectionNFT = await createCollection(metaplex, {
        name: options.name,
        symbol: options.symbol,
        uri: metadataResult.url,
        sellerFeeBasisPoints: 0, // Coleções não têm royalties
        creators: [
          {
            address: keypair.publicKey,
            share: 100,
          }
        ],
        isMutable: !options.immutable,
        maxSupply: options.maxSupply ? parseInt(options.maxSupply) : undefined,
      });
      
      console.log('\n✅ Coleção NFT criada com sucesso!');
      console.log(`🎯 Mint da Coleção: ${collectionNFT.address.toString()}`);
      console.log(`📄 Metadata Account: ${collectionNFT.metadataAddress.toString()}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/address/${collectionNFT.address.toString()}?cluster=${networkConfig.name}`);
      
      // Salvar informações da coleção
      const collectionInfo = {
        mint: collectionNFT.address.toString(),
        metadata: collectionNFT.metadataAddress.toString(),
        name: options.name,
        symbol: options.symbol,
        metadataUri: metadataResult.url,
        updateAuthority: keypair.publicKey.toString(),
        isCollection: true,
        isMutable: !options.immutable,
        maxSupply: options.maxSupply || null,
        createdAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações da Coleção:');
      console.log(JSON.stringify(collectionInfo, null, 2));
      
      console.log('\n🎉 Coleção Metaplex criada com sucesso!');
      console.log('💡 Próximos passos:');
      console.log(`   1. Use este mint para criar NFTs: ${collectionNFT.address.toString()}`);
      console.log('   2. Mintar assets de pesquisa vinculados a esta coleção');
      console.log('   3. Verificar no Solana Explorer e Magic Eden');
      console.log('   4. Configurar curadoria da coleção');
      
    } catch (error) {
      console.error('❌ Erro ao criar coleção:', error);
      process.exit(1);
    }
  });

program.parse();
