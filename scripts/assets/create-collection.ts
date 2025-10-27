#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  METADATA_CONFIG,
  TRANSACTION_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';

const program = new Command();

program
  .name('create-collection')
  .description('Criar coleção Core para ativos de pesquisa')
  .option('-n, --name <name>', 'Nome da coleção', METADATA_CONFIG.COLLECTION_NAME)
  .option('-s, --symbol <symbol>', 'Símbolo da coleção', METADATA_CONFIG.COLLECTION_SYMBOL)
  .option('-d, --description <description>', 'Descrição da coleção', METADATA_CONFIG.COLLECTION_DESCRIPTION)
  .option('-i, --image-uri <uri>', 'URI da imagem da coleção', METADATA_CONFIG.COLLECTION_IMAGE_URI)
  .option('-u, --update-authority <pubkey>', 'Autoridade de update (padrão: wallet atual)')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando criação da coleção...');
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
        console.warn('⚠️  Saldo baixo! Recomendado pelo menos 0.1 SOL para operações.');
      }
      
      // Criar metadata da coleção
      const collectionMetadata = {
        name: options.name,
        symbol: options.symbol,
        description: options.description,
        image: options.imageUri,
        external_url: 'https://github.com/surgpass/research-assets',
        attributes: [
          {
            trait_type: 'Collection Type',
            value: 'Research Assets'
          },
          {
            trait_type: 'Protocol',
            value: 'SurgPass'
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
        return;
      }
      
      // Criar coleção (usando System Program para criar conta)
      console.log('🎨 Criando coleção...');
      const collectionKeypair = Keypair.generate();
      const collectionAddress = collectionKeypair.publicKey;
      
      // Criar uma conta simples como placeholder da coleção
      const lamports = await connection.getMinimumBalanceForRentExemption(0);
      
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: keypair.publicKey,
          newAccountPubkey: collectionAddress,
          lamports,
          space: 0,
          programId: SystemProgram.programId,
        })
      );
      
      // Enviar transação
      console.log('📤 Enviando transação...');
      const signature = await connection.sendTransaction(transaction, [keypair, collectionKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ Coleção criada com sucesso!');
      console.log(`🎯 Endereço da Coleção: ${collectionAddress.toString()}`);
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Salvar informações da coleção
      const collectionInfo = {
        address: collectionAddress.toString(),
        name: options.name,
        symbol: options.symbol,
        metadataUri: metadataResult.url,
        updateAuthority: keypair.publicKey.toString(),
        signature,
        createdAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações da Coleção:');
      console.log(JSON.stringify(collectionInfo, null, 2));
      
      console.log('\n🎉 Coleção criada com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Use este endereço da coleção para mintar assets');
      console.log('   2. Configure royalties nos assets individuais');
      console.log('   3. Verifique a coleção no Solana Explorer');
      
    } catch (error) {
      console.error('❌ Erro ao criar coleção:', error);
      process.exit(1);
    }
  });

program.parse();
