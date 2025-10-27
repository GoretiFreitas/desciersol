#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  ROYALTY_CONFIG,
  TRANSACTION_CONFIG,
  VALIDATION_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';
import { ResearchAssetMetadata, Creator, RoyaltyConfig } from '../../lib/types.js';

const program = new Command();

program
  .name('mint-research-asset-simple')
  .description('Mintar asset de pesquisa (versão simplificada)')
  .requiredOption('-t, --title <title>', 'Título do asset de pesquisa')
  .requiredOption('-a, --authors <authors>', 'Lista de autores (separados por vírgula)')
  .requiredOption('-h, --hash <hash>', 'Hash SHA-256 do arquivo')
  .requiredOption('-u, --uri <uri>', 'URI do arquivo no Arweave')
  .option('-d, --description <description>', 'Descrição do asset')
  .option('--tags <tags>', 'Tags (separadas por vírgula)')
  .option('-c, --collection <pubkey>', 'Endereço da coleção (opcional)')
  .option('--royalty <basisPoints>', 'Royalty basis points', ROYALTY_CONFIG.DEFAULT_SELLER_FEE_BASIS_POINTS.toString())
  .option('--creators <creators>', 'Criadores e shares (formato: "pubkey1:share1,pubkey2:share2")')
  .option('--version <version>', 'Versão do protocolo')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando mint de asset de pesquisa...');
      
      // Validar inputs
      if (options.title.length > VALIDATION_CONFIG.MAX_TITLE_LENGTH) {
        throw new Error(`Título muito longo. Máximo ${VALIDATION_CONFIG.MAX_TITLE_LENGTH} caracteres.`);
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
      if (royaltyBasisPoints < ROYALTY_CONFIG.MIN_SELLER_FEE_BASIS_POINTS || 
          royaltyBasisPoints > ROYALTY_CONFIG.MAX_SELLER_FEE_BASIS_POINTS) {
        throw new Error(`Royalty inválido. Deve estar entre ${ROYALTY_CONFIG.MIN_SELLER_FEE_BASIS_POINTS} e ${ROYALTY_CONFIG.MAX_SELLER_FEE_BASIS_POINTS} basis points.`);
      }
      
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
      let creators: Creator[] = [];
      if (options.creators) {
        const creatorStrings = options.creators.split(',');
        creators = creatorStrings.map((creatorStr: string) => {
          const [address, share] = creatorStr.split(':');
          return {
            address: new PublicKey(address.trim()),
            share: parseInt(share.trim()),
            verified: false
          };
        });
      } else {
        // Criador padrão: wallet atual
        creators = [{
          address: keypair.publicKey,
          share: 100,
          verified: true
        }];
      }
      
      // Verificar se shares somam 100
      const totalShare = creators.reduce((sum, creator) => sum + creator.share, 0);
      if (totalShare !== 100) {
        throw new Error(`Shares dos criadores devem somar 100. Atual: ${totalShare}`);
      }
      
      // Criar metadata do asset
      const assetMetadata: ResearchAssetMetadata = {
        title: options.title,
        authors,
        fileHash: options.hash,
        fileUri: options.uri,
        description: options.description,
        tags,
        createdAt: new Date().toISOString(),
        version: options.version
      };
      
      console.log('📤 Uploading metadata para Arweave...');
      const metadataResult = await uploadMetadataToArweave(assetMetadata);
      console.log(`✅ Metadata URI: ${metadataResult.url}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`📄 Metadata seria criada em: ${metadataResult.url}`);
        console.log(`🎯 Asset seria mintado com URI: ${metadataResult.url}`);
        return;
      }
      
      // Criar asset (usando System Program para criar conta)
      console.log('🎨 Mintando asset...');
      const assetKeypair = Keypair.generate();
      const assetAddress = assetKeypair.publicKey;
      
      // Criar uma conta simples como placeholder do asset
      const lamports = await connection.getMinimumBalanceForRentExemption(0);
      
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: keypair.publicKey,
          newAccountPubkey: assetAddress,
          lamports,
          space: 0,
          programId: SystemProgram.programId,
        })
      );
      
      // Enviar transação
      console.log('📤 Enviando transação...');
      const signature = await connection.sendTransaction(transaction, [keypair, assetKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ Asset mintado com sucesso!');
      console.log(`🎯 Endereço do Asset: ${assetAddress.toString()}`);
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Salvar informações do asset
      const assetInfo = {
        address: assetAddress.toString(),
        title: options.title,
        authors,
        fileHash: options.hash,
        fileUri: options.uri,
        metadataUri: metadataResult.url,
        collection: options.collection || null,
        creators: creators.map(c => ({
          address: c.address.toString(),
          share: c.share,
          verified: c.verified
        })),
        royaltyBasisPoints,
        signature,
        createdAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações do Asset:');
      console.log(JSON.stringify(assetInfo, null, 2));
      
      console.log('\n🎉 Asset mintado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Verifique o asset no Solana Explorer');
      console.log('   2. Configure transfer restrictions se necessário');
      console.log('   3. Adicione o asset à sua coleção');
      
    } catch (error) {
      console.error('❌ Erro ao mintar asset:', error);
      process.exit(1);
    }
  });

program.parse();
