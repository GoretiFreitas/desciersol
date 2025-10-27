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
  ROYALTY_CONFIG,
  VALIDATION_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';
import { ResearchAssetMetadata } from '../../lib/types.js';
import { 
  createMetaplex, 
  createNFT,
  MetaplexNFTMetadata 
} from '../../lib/metaplex.js';
import { 
  RESEARCH_NFT_DEFAULTS,
  RESEARCH_TRAIT_TYPES,
  validateCreators,
  validateSellerFee 
} from '../../lib/metaplex-config.js';

const program = new Command();

program
  .name('mint-research-asset-metaplex')
  .description('Mintar asset de pesquisa como NFT real usando Metaplex')
  .requiredOption('-t, --title <title>', 'Título do asset de pesquisa')
  .requiredOption('-a, --authors <authors>', 'Lista de autores (separados por vírgula)')
  .requiredOption('-h, --hash <hash>', 'Hash SHA-256 do arquivo')
  .requiredOption('-u, --uri <uri>', 'URI do arquivo no Arweave')
  .option('-d, --description <description>', 'Descrição do asset')
  .option('--tags <tags>', 'Tags (separadas por vírgula)')
  .option('-c, --collection <pubkey>', 'Mint da coleção NFT')
  .option('--royalty <basisPoints>', 'Royalty basis points', ROYALTY_CONFIG.DEFAULT_SELLER_FEE_BASIS_POINTS.toString())
  .option('--creators <creators>', 'Criadores e shares (formato: "pubkey1:share1,pubkey2:share2")')
  .option('--version <version>', 'Versão do protocolo')
  .option('--doi <doi>', 'DOI do paper')
  .option('--license <license>', 'Licença (ex: CC-BY-4.0)')
  .option('--image <uri>', 'URI da imagem de preview do NFT')
  .option('--immutable', 'Tornar NFT imutável')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando mint de asset de pesquisa (Metaplex)...');
      
      // Validar e truncar título (Metaplex tem limite de 32 chars)
      const MAX_NAME_LENGTH = 32;
      let nftName = options.title;
      
      if (nftName.length > MAX_NAME_LENGTH) {
        nftName = nftName.substring(0, MAX_NAME_LENGTH - 3) + '...';
        console.log(`⚠️  Título truncado para ${MAX_NAME_LENGTH} caracteres: "${nftName}"`);
      }
      
      if (options.description && options.description.length > VALIDATION_CONFIG.MAX_DESCRIPTION_LENGTH) {
        throw new Error(`Descrição muito longa. Máximo ${VALIDATION_CONFIG.MAX_DESCRIPTION_LENGTH} caracteres.`);
      }
      
      const authors = options.authors.split(',').map((a: string) => a.trim());
      if (authors.length > VALIDATION_CONFIG.MAX_AUTHORS) {
        throw new Error(`Muitos autores. Máximo ${VALIDATION_CONFIG.MAX_AUTHORS}.`);
      }
      
      const tags = options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [];
      if (tags.length > VALIDATION_CONFIG.MAX_TAGS) {
        throw new Error(`Muitas tags. Máximo ${VALIDATION_CONFIG.MAX_TAGS}.`);
      }
      
      const royaltyBasisPoints = parseInt(options.royalty);
      validateSellerFee(royaltyBasisPoints);
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      console.log('📋 Configuração:');
      console.log(`   Título: ${options.title}`);
      console.log(`   Autores: ${authors.join(', ')}`);
      console.log(`   Hash: ${options.hash}`);
      console.log(`   URI: ${options.uri}`);
      console.log(`   Royalty: ${royaltyBasisPoints} basis points (${(royaltyBasisPoints / 100).toFixed(2)}%)`);
      
      // Processar criadores
      let creators: Array<{ address: PublicKey; share: number }> = [];
      if (options.creators) {
        const creatorStrings = options.creators.split(',');
        creators = creatorStrings.map((creatorStr: string) => {
          const [address, share] = creatorStr.split(':');
          return {
            address: new PublicKey(address.trim()),
            share: parseInt(share.trim()),
          };
        });
      } else {
        // Criador padrão: wallet atual
        creators = [{
          address: keypair.publicKey,
          share: 100,
        }];
      }
      
      // Validar creators
      validateCreators(creators);
      
      // Criar metadata do NFT (padrão Metaplex)
      const nftMetadata: MetaplexNFTMetadata = {
        name: options.title,
        symbol: RESEARCH_NFT_DEFAULTS.symbol,
        description: options.description || `Asset de pesquisa: ${options.title}`,
        image: options.image || options.imageUri || 'https://arweave.net/default-research-asset.png',
        external_url: RESEARCH_NFT_DEFAULTS.external_url,
        attributes: [
          {
            trait_type: RESEARCH_TRAIT_TYPES.FILE_HASH,
            value: options.hash
          },
          {
            trait_type: RESEARCH_TRAIT_TYPES.AUTHORS,
            value: authors.join(', ')
          },
          ...(options.version ? [{
            trait_type: RESEARCH_TRAIT_TYPES.VERSION,
            value: options.version
          }] : []),
          ...(options.doi ? [{
            trait_type: RESEARCH_TRAIT_TYPES.DOI,
            value: options.doi
          }] : []),
          ...(options.license ? [{
            trait_type: RESEARCH_TRAIT_TYPES.LICENSE,
            value: options.license
          }] : []),
          {
            trait_type: RESEARCH_TRAIT_TYPES.PUBLICATION_DATE,
            value: new Date().toISOString().split('T')[0]
          },
          ...tags.map((tag: string) => ({
            trait_type: 'Tag',
            value: tag
          }))
        ],
        properties: {
          files: [
            {
              uri: options.uri,
              type: 'application/pdf',
              hash: options.hash
            }
          ],
          category: 'document',
          creators: creators.map(c => ({
            address: c.address.toString(),
            share: c.share,
            verified: c.address.equals(keypair.publicKey)
          }))
        }
      };
      
      console.log('📤 Uploading metadata para Arweave...');
      const metadataResult = await uploadMetadataToArweave(nftMetadata);
      console.log(`✅ Metadata URI: ${metadataResult.url}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`📄 Metadata seria criada em: ${metadataResult.url}`);
        console.log(`🎯 NFT seria mintado com Metaplex SDK`);
        return;
      }
      
      // Criar instância do Metaplex
      const metaplex = createMetaplex(connection, keypair);
      
      // Criar NFT
      const nft = await createNFT(metaplex, {
        name: nftName,
        symbol: RESEARCH_NFT_DEFAULTS.symbol,
        uri: metadataResult.url,
        sellerFeeBasisPoints: royaltyBasisPoints,
        creators,
        collection: options.collection ? new PublicKey(options.collection) : undefined,
        collectionAuthority: options.collection ? keypair : undefined,
        isMutable: !options.immutable,
      });
      
      console.log('\n✅ Asset NFT mintado com sucesso!');
      console.log(`🎯 Mint do NFT: ${nft.address.toString()}`);
      console.log(`📄 Metadata Account: ${nft.metadataAddress.toString()}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/address/${nft.address.toString()}?cluster=${networkConfig.name}`);
      
      // Salvar informações do NFT
      const nftInfo = {
        mint: nft.address.toString(),
        metadata: nft.metadataAddress.toString(),
        title: options.title,
        authors,
        fileHash: options.hash,
        fileUri: options.uri,
        metadataUri: metadataResult.url,
        collection: options.collection || null,
        creators: creators.map(c => ({
          address: c.address.toString(),
          share: c.share
        })),
        royaltyBasisPoints,
        isMutable: !options.immutable,
        createdAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações do NFT:');
      console.log(JSON.stringify(nftInfo, null, 2));
      
      console.log('\n🎉 Asset NFT criado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Verifique o NFT no Solana Explorer');
      console.log('   2. Veja o NFT em sua wallet (Solflare, Phantom)');
      console.log('   3. Liste no marketplace se desejar');
      console.log('   4. Configure permissões e transfers');
      
    } catch (error) {
      console.error('❌ Erro ao mintar NFT:', error);
      process.exit(1);
    }
  });

program.parse();
