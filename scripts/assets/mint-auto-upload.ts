#!/usr/bin/env tsx

/**
 * Script AUTOMATIZADO para mintar NFT com upload REAL no Arweave
 * Detecta automaticamente qual método de upload usar baseado em saldo
 * 
 * Prioridade: Irys > Turbo > Placeholder
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
  .name('mint-auto-upload')
  .description('Mintar NFT com upload AUTOMÁTICO (detecta melhor método)')
  .requiredOption('-t, --title <title>', 'Título do asset')
  .requiredOption('-a, --authors <authors>', 'Autores (separados por vírgula)')
  .requiredOption('-h, --hash <hash>', 'Hash SHA-256 do arquivo')
  .requiredOption('-u, --uri <uri>', 'URI do arquivo no Arweave')
  .option('-d, --description <description>', 'Descrição')
  .option('--tags <tags>', 'Tags (separadas por vírgula)')
  .option('-c, --collection <pubkey>', 'Mint da coleção')
  .option('--royalty <basisPoints>', 'Royalty basis points', '500')
  .option('--creators <creators>', 'Criadores (formato: "pubkey1:share1,pubkey2:share2")')
  .option('--version <version>', 'Versão')
  .option('--doi <doi>', 'DOI')
  .option('--license <license>', 'Licença')
  .option('--image <uri>', 'URI da imagem')
  .option('--immutable', 'NFT imutável')
  .option('--force-placeholder', 'Forçar uso de placeholder')
  .option('--dry-run', 'Simular apenas')
  .action(async (options) => {
    try {
      console.log('🚀 Mint Automatizado com Upload Real no Arweave\n');
      
      // Validar título
      const MAX_NAME_LENGTH = 32;
      let nftName = options.title;
      if (nftName.length > MAX_NAME_LENGTH) {
        nftName = nftName.substring(0, MAX_NAME_LENGTH - 3) + '...';
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
      
      // AUTO-DETECTAR melhor método de upload
      let metadataUri: string;
      let uploadMethod: string;
      
      if (options.forceplaceholder) {
        uploadMethod = 'placeholder';
      } else {
        console.log('\n🔍 Detectando melhor método de upload...');
        
        // Tentar Irys primeiro (já está configurado)
        try {
          const { createIrysUploader, getIrysBalanceV2, estimateUploadCost } = await import('../../lib/irys-uploader-v2.js');
          const uploader = await createIrysUploader(keypair, networkConfig.name !== 'mainnet-beta');
          const balance = await getIrysBalanceV2(uploader);
          const cost = await estimateUploadCost(uploader, Buffer.from(JSON.stringify(nftMetadata)).length);
          
          if (balance >= cost) {
            console.log(`✅ Irys disponível! Saldo: ${balance.toFixed(6)} SOL`);
            uploadMethod = 'irys';
          } else {
            throw new Error('Saldo insuficiente');
          }
        } catch (irysError) {
          console.log('⚠️  Irys não disponível');
          
          // Tentar Turbo
          try {
            const { createTurboClient, getTurboBalance } = await import('../../lib/turbo-uploader.js');
            const turbo = await createTurboClient();
            const turboBalance = await getTurboBalance(turbo);
            
            if (turboBalance > 0) {
              console.log(`✅ Turbo disponível! Saldo: ${turboBalance} winc`);
              uploadMethod = 'turbo';
            } else {
              throw new Error('Saldo insuficiente');
            }
          } catch (turboError) {
            console.log('⚠️  Turbo não disponível');
            console.log('📝 Usando placeholder');
            uploadMethod = 'placeholder';
          }
        }
      }
      
      console.log(`\n📤 Método escolhido: ${uploadMethod.toUpperCase()}`);
      
      // Upload baseado no método detectado
      switch (uploadMethod) {
        case 'irys':
          const { createIrysUploader: createIrys, uploadMetadataToIrysV2 } = await import('../../lib/irys-uploader-v2.js');
          const irysUploader = await createIrys(keypair, networkConfig.name !== 'mainnet-beta');
          const irysResult = await uploadMetadataToIrysV2(irysUploader, nftMetadata, {
            'Data-Protocol': 'research-asset'
          });
          metadataUri = irysResult.url;
          console.log('✅ Upload via Irys concluído!');
          break;
          
        case 'turbo':
          const { createTurboClient: createTurbo, uploadMetadataToTurbo } = await import('../../lib/turbo-uploader.js');
          const turboClient = await createTurbo();
          const turboResult = await uploadMetadataToTurbo(turboClient, nftMetadata, {
            'Data-Protocol': 'research-asset'
          });
          metadataUri = turboResult.url;
          console.log('✅ Upload via Turbo concluído!');
          break;
          
        case 'placeholder':
        default:
          const { uploadMetadataToArweave } = await import('../../lib/arweave-placeholder.js');
          const placeholderResult = await uploadMetadataToArweave(nftMetadata);
          metadataUri = placeholderResult.url;
          console.log('⚠️  Usando placeholder (metadata não será publicamente acessível)');
          break;
      }
      
      console.log(`\n✅ Metadata URI: ${metadataUri}`);
      
      if (options.dryRun) {
        console.log('\n🔍 [DRY RUN] NFT não mintado');
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
      console.log(`🌐 Metadata URI (${uploadMethod.toUpperCase()}): ${metadataUri}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/address/${nft.address.toString()}?cluster=${networkConfig.name}`);
      
      const nftInfo = {
        mint: nft.address.toString(),
        metadata: nft.metadataAddress.toString(),
        title: options.title,
        metadataUri,
        uploadMethod,
        isRealMetadata: uploadMethod !== 'placeholder',
        createdAt: new Date().toISOString()
      };
      
      console.log('\n📋 Info:');
      console.log(JSON.stringify(nftInfo, null, 2));
      
      console.log('\n🎉 Sucesso!');
      if (uploadMethod !== 'placeholder') {
        console.log(`✅ Metadata REAL: ${metadataUri}`);
        console.log('   Aguarde 1-2 min para propagação completa');
      } else {
        console.log('⚠️  Para metadata real:');
        console.log('   1. Irys: npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01');
        console.log('   2. Turbo: https://turbo-topup.com');
      }
      
    } catch (error) {
      console.error('❌ Erro:', error);
      console.log('\n💡 Soluções:');
      console.log('   - Irys: npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01');
      console.log('   - Turbo: https://turbo-topup.com');
      console.log('   - Placeholder: --force-placeholder');
      process.exit(1);
    }
  });

program.parse();
