#!/usr/bin/env tsx

/**
 * Mintar NFT de Pesquisa com Metadata REAL no Arweave
 * Suporta 3 métodos de upload:
 * 1. Turbo (ArDrive) - Recomendado, aceita SOL diretamente
 * 2. Irys V2 - Devnet/Mainnet
 * 3. Placeholder - Para testes sem custo
 */

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

const program = new Command();

program
  .name('mint-with-real-metadata')
  .description('Mintar NFT com metadata REAL no Arweave (Turbo ou Irys)')
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
  .option('--image <uri>', 'URI da imagem de preview')
  .option('--immutable', 'Tornar NFT imutável')
  .option('--upload-method <method>', 'Método de upload: turbo, irys ou placeholder', 'turbo')
  .option('--dry-run', 'Apenas simular')
  .action(async (options) => {
    try {
      console.log('🚀 Mintando NFT com Metadata REAL no Arweave...\n');
      
      // Validar título
      const MAX_NAME_LENGTH = 32;
      let nftName = options.title;
      
      if (nftName.length > MAX_NAME_LENGTH) {
        nftName = nftName.substring(0, MAX_NAME_LENGTH - 3) + '...';
        console.log(`⚠️  Título truncado: "${nftName}"`);
      }
      
      const authors = options.authors.split(',').map((a: string) => a.trim());
      const tags = options.tags ? options.tags.split(',').map((t: string) => t.trim()) : [];
      const royaltyBasisPoints = parseInt(options.royalty);
      
      validateSellerFee(royaltyBasisPoints);
      
      // Configurar
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      console.log('📋 Configuração:');
      console.log(`   Título: ${options.title}`);
      console.log(`   Autores: ${authors.join(', ')}`);
      console.log(`   Método Upload: ${options.uploadMethod.toUpperCase()}`);
      console.log(`   Royalty: ${(royaltyBasisPoints / 100).toFixed(2)}%`);
      
      // Processar creators
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
        creators = [{ address: keypair.publicKey, share: 100 }];
      }
      
      validateCreators(creators);
      
      // Criar metadata
      const nftMetadata: MetaplexNFTMetadata = {
        name: options.title,
        symbol: RESEARCH_NFT_DEFAULTS.symbol,
        description: options.description || `Asset de pesquisa: ${options.title}`,
        image: options.image || 'https://arweave.net/default-research-asset.png',
        external_url: RESEARCH_NFT_DEFAULTS.external_url,
        attributes: [
          { trait_type: RESEARCH_TRAIT_TYPES.FILE_HASH, value: options.hash },
          { trait_type: RESEARCH_TRAIT_TYPES.AUTHORS, value: authors.join(', ') },
          ...(options.version ? [{ trait_type: RESEARCH_TRAIT_TYPES.VERSION, value: options.version }] : []),
          ...(options.doi ? [{ trait_type: RESEARCH_TRAIT_TYPES.DOI, value: options.doi }] : []),
          ...(options.license ? [{ trait_type: RESEARCH_TRAIT_TYPES.LICENSE, value: options.license }] : []),
          { trait_type: RESEARCH_TRAIT_TYPES.PUBLICATION_DATE, value: new Date().toISOString().split('T')[0] },
          ...tags.map((tag: string) => ({ trait_type: 'Tag', value: tag }))
        ],
        properties: {
          files: [{ uri: options.uri, type: 'application/pdf', hash: options.hash }],
          category: 'document',
          creators: creators.map(c => ({
            address: c.address.toString(),
            share: c.share,
            verified: c.address.equals(keypair.publicKey)
          }))
        }
      };
      
      // Upload metadata
      let metadataUri: string;
      
      console.log(`\n📤 Método de upload: ${options.uploadMethod.toUpperCase()}`);
      
      switch (options.uploadMethod.toLowerCase()) {
        case 'turbo':
          console.log('📤 Uploading via Turbo (ArDrive)...');
          console.log('💡 NOTA: Turbo requer top-up via https://turbo-topup.com');
          console.log('   Aceita: SOL, cartão de crédito, ETH, USDC, AR, MATIC');
          
          const { createTurboClient, uploadMetadataToTurbo, getTurboBalance } = await import('../../lib/turbo-uploader.js');
          const turbo = await createTurboClient();
          
          // Verificar saldo
          const turboBalance = await getTurboBalance(turbo);
          if (turboBalance === 0) {
            console.warn('\n⚠️  Saldo Turbo insuficiente!');
            console.warn('   1. Faça top-up: https://turbo-topup.com');
            console.warn('   2. Ou use: --upload-method irys (já configurado)');
            console.warn('   3. Ou use: --upload-method placeholder (grátis)');
            throw new Error('Saldo Turbo insuficiente. Faça top-up primeiro.');
          }
          
          const turboResult = await uploadMetadataToTurbo(turbo, nftMetadata, {
            'Data-Protocol': 'research-asset',
            'Content-Category': 'research-paper'
          });
          metadataUri = turboResult.url;
          break;
          
        case 'irys':
          console.log('📤 Uploading via Irys V2...');
          const { createIrysUploader, uploadMetadataToIrysV2 } = await import('../../lib/irys-uploader-v2.js');
          const uploader = await createIrysUploader(keypair, networkConfig.name !== 'mainnet-beta');
          const irysResult = await uploadMetadataToIrysV2(uploader, nftMetadata, {
            'Data-Protocol': 'research-asset'
          });
          metadataUri = irysResult.url;
          break;
          
        case 'placeholder':
        default:
          console.log('📤 Usando placeholder...');
          const { uploadMetadataToArweave } = await import('../../lib/arweave-placeholder.js');
          const placeholderResult = await uploadMetadataToArweave(nftMetadata);
          metadataUri = placeholderResult.url;
          break;
      }
      
      console.log(`✅ Metadata URI: ${metadataUri}`);
      
      if (options.dryRun) {
        console.log('\n🔍 [DRY RUN] NFT não seria mintado');
        return;
      }
      
      // Criar NFT
      const metaplex = createMetaplex(connection, keypair);
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
      
      console.log('\n✅ NFT criado com sucesso!');
      console.log(`🎯 Mint: ${nft.address.toString()}`);
      console.log(`📄 Metadata: ${nft.metadataAddress.toString()}`);
      console.log(`🌐 Metadata URI: ${metadataUri}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/address/${nft.address.toString()}?cluster=${networkConfig.name}`);
      
      console.log('\n🎉 Sucesso! NFT criado com metadata REAL!');
      console.log(`💡 Acesse: ${metadataUri}`);
      
    } catch (error) {
      console.error('❌ Erro:', error);
      console.log('\n💡 Soluções:');
      console.log('   - Turbo: Faça top-up em https://turbo-topup.com');
      console.log('   - Irys: npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01');
      console.log('   - Placeholder: Adicione --upload-method placeholder');
      process.exit(1);
    }
  });

program.parse();
