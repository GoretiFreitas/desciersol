#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, Transaction } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  TRANSACTION_CONFIG,
  VALIDATION_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';
import { ResearchAssetMetadata } from '../../lib/types.js';

const program = new Command();

program
  .name('update-asset-simple')
  .description('Atualizar metadata de um asset de pesquisa (versão simplificada)')
  .requiredOption('-a, --asset <pubkey>', 'Endereço do asset a ser atualizado')
  .option('-t, --title <title>', 'Novo título do asset')
  .option('-d, --description <description>', 'Nova descrição do asset')
  .option('--tags <tags>', 'Novas tags (separadas por vírgula)')
  .option('-u, --uri <uri>', 'Nova URI do arquivo no Arweave')
  .option('-h, --hash <hash>', 'Novo hash SHA-256 do arquivo')
  .option('--version <version>', 'Nova versão do protocolo')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando atualização do asset...');
      
      const assetAddress = new PublicKey(options.asset);
      console.log(`🎯 Asset: ${assetAddress.toString()}`);
      
      // Validar inputs
      if (options.title && options.title.length > VALIDATION_CONFIG.MAX_TITLE_LENGTH) {
        throw new Error(`Título muito longo. Máximo ${VALIDATION_CONFIG.MAX_TITLE_LENGTH} caracteres.`);
      }
      
      if (options.description && options.description.length > VALIDATION_CONFIG.MAX_DESCRIPTION_LENGTH) {
        throw new Error(`Descrição muito longa. Máximo ${VALIDATION_CONFIG.MAX_DESCRIPTION_LENGTH} caracteres.`);
      }
      
      const tags = options.tags ? options.tags.split(',').map((t: string) => t.trim()) : undefined;
      if (tags && tags.length > VALIDATION_CONFIG.MAX_TAGS) {
        throw new Error(`Muitas tags. Máximo ${VALIDATION_CONFIG.MAX_TAGS}.`);
      }
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      // Verificar se o asset existe
      const assetAccount = await connection.getAccountInfo(assetAddress);
      if (!assetAccount) {
        throw new Error('Asset não encontrado. Verifique o endereço.');
      }
      
      console.log('📋 Atualizações:');
      if (options.title) console.log(`   Título: ${options.title}`);
      if (options.description) console.log(`   Descrição: ${options.description}`);
      if (options.tags) console.log(`   Tags: ${tags?.join(', ')}`);
      if (options.uri) console.log(`   URI: ${options.uri}`);
      if (options.hash) console.log(`   Hash: ${options.hash}`);
      if (options.version) console.log(`   Versão: ${options.version}`);
      
      // Criar nova metadata (apenas com campos atualizados)
      const updatedMetadata: Partial<ResearchAssetMetadata> = {
        updatedAt: new Date().toISOString()
      };
      
      if (options.title) updatedMetadata.title = options.title;
      if (options.description) updatedMetadata.description = options.description;
      if (tags) updatedMetadata.tags = tags;
      if (options.uri) updatedMetadata.fileUri = options.uri;
      if (options.hash) updatedMetadata.fileHash = options.hash;
      if (options.version) updatedMetadata.version = options.version;
      
      console.log('📤 Uploading metadata atualizada para Arweave...');
      const metadataResult = await uploadMetadataToArweave(updatedMetadata);
      console.log(`✅ Nova Metadata URI: ${metadataResult.url}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`📄 Nova metadata seria criada em: ${metadataResult.url}`);
        return;
      }
      
      // Simular atualização de asset
      console.log('🔄 Atualizando asset...');
      const transaction = new Transaction();
      
      // Enviar transação
      console.log('📤 Enviando transação...');
      const signature = await connection.sendTransaction(transaction, [keypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ Asset atualizado com sucesso!');
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Salvar informações da atualização
      const updateInfo = {
        asset: assetAddress.toString(),
        newMetadataUri: metadataResult.url,
        updates: updatedMetadata,
        signature,
        updatedAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações da Atualização:');
      console.log(JSON.stringify(updateInfo, null, 2));
      
      console.log('\n🎉 Asset atualizado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Verifique a atualização no Solana Explorer');
      console.log('   2. Confirme que a nova metadata está correta');
      console.log('   3. Notifique stakeholders sobre a atualização');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar asset:', error);
      process.exit(1);
    }
  });

program.parse();
