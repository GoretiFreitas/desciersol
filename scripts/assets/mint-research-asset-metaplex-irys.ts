#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  ROYALTY_CONFIG,
  VALIDATION_CONFIG 
} from '../../lib/constants.js';
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
import {
  createIrysUploader,
  uploadMetadataToIrysV2,
  getIrysBalanceV2,
  estimateUploadCost
} from '../../lib/irys-uploader-v2.js';

const program = new Command();

program
  .name('mint-research-asset-metaplex-irys')
  .description('Mintar asset de pesquisa como NFT real com upload REAL no Arweave')
  .requiredOption('-t, --title <title>', 'Título do asset de pesquisa')
  .requiredOption('-a, --authors <authors>', 'Lista de autores (separados por vírgula)')
  .requiredOption('-h, --hash <hash>', 'Hash SHA-256 do arquivo')
  .requiredOption('-u, --uri <uri>', 'URI do arquivo no Arweave (ou deixe vazio para usar metadata como prova)')
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
  .option('--use-placeholder', 'Usar placeholder ao invés de Irys (não requer funding)')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando mint de asset de pesquisa (Metaplex + Irys)...');
      
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
        creators = [{
          address: keypair.publicKey,
          share: 100,
        }];
      }
      
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
      
      // Upload metadata para Arweave
      let metadataUri: string;
      
      if (options.usePlaceholder) {
        // Usar placeholder (não requer funding)
        console.log('📤 Usando upload placeholder (sem Irys)...');
        const { uploadMetadataToArweave } = await import('../../lib/arweave-placeholder.js');
        const result = await uploadMetadataToArweave(nftMetadata);
        metadataUri = result.url;
      } else {
        // Upload REAL via Irys V2
        console.log('📤 Uploading metadata REAL via Irys V2...');
        const uploader = await createIrysUploader(
          keypair, 
          networkConfig.name !== 'mainnet-beta' // true = devnet
        );
        
        // Verificar saldo
        const balance = await getIrysBalanceV2(uploader);
        const metadataSize = Buffer.from(JSON.stringify(nftMetadata)).length;
        const cost = await estimateUploadCost(uploader, metadataSize);
        
        console.log(`💰 Custo estimado: ${cost.toFixed(8)} SOL`);
        console.log(`💰 Saldo Irys: ${balance.toFixed(6)} SOL`);
        
        if (balance < cost) {
          console.warn(`⚠️  Saldo Irys insuficiente!`);
          console.warn(`   Necessário: ${cost.toFixed(8)} SOL`);
          console.warn(`   Disponível: ${balance.toFixed(6)} SOL`);
          console.warn(`   Use --use-placeholder para testes sem funding`);
          console.warn(`\n   Para fazer fund:`);
          console.warn(`   npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01`);
          throw new Error('Saldo Irys insuficiente.');
        }
        
        const uploadResult = await uploadMetadataToIrysV2(uploader, nftMetadata, {
          'Data-Protocol': 'research-asset',
          'Content-Category': 'research-paper'
        });
        
        metadataUri = uploadResult.url;
      }
      
      console.log(`✅ Metadata URI: ${metadataUri}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`📄 Metadata criada em: ${metadataUri}`);
        console.log(`🎯 NFT seria mintado com Metaplex SDK`);
        return;
      }
      
      // Criar instância do Metaplex
      const metaplex = createMetaplex(connection, keypair);
      
      // Criar NFT
      const nft = await createNFT(metaplex, {
        name: nftName,
        symbol: RESEARCH_NFT_DEFAULTS.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: royaltyBasisPoints,
        creators,
        collection: options.collection ? new PublicKey(options.collection) : undefined,
        collectionAuthority: options.collection ? keypair : undefined,
        isMutable: !options.immutable,
      });
      
      console.log('\n✅ Asset NFT mintado com sucesso!');
      console.log(`🎯 Mint do NFT: ${nft.address.toString()}`);
      console.log(`📄 Metadata Account: ${nft.metadataAddress.toString()}`);
      console.log(`🌐 Metadata URI (REAL): ${metadataUri}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/address/${nft.address.toString()}?cluster=${networkConfig.name}`);
      
      // Salvar informações do NFT
      const nftInfo = {
        mint: nft.address.toString(),
        metadata: nft.metadataAddress.toString(),
        title: options.title,
        authors,
        fileHash: options.hash,
        fileUri: options.uri,
        metadataUri,
        collection: options.collection || null,
        creators: creators.map(c => ({
          address: c.address.toString(),
          share: c.share
        })),
        royaltyBasisPoints,
        isMutable: !options.immutable,
        uploadMethod: options.usePlaceholder ? 'placeholder' : 'irys',
        createdAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações do NFT:');
      console.log(JSON.stringify(nftInfo, null, 2));
      
      console.log('\n🎉 Asset NFT criado com metadata REAL no Arweave!');
      console.log('💡 Próximos passos:');
      console.log(`   1. Acesse a metadata: ${metadataUri}`);
      console.log('   2. Veja o NFT em sua wallet (Solflare, Phantom)');
      console.log('   3. Verifique no Solana Explorer');
      console.log('   4. Liste no marketplace se desejar');
      
    } catch (error) {
      console.error('❌ Erro ao mintar NFT:', error);
      process.exit(1);
    }
  });

program.parse();
