#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { 
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl,
  accountExists 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  SBT_CONFIG,
  TRANSACTION_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';
import { ReviewerBadgeMetadata } from '../../lib/types.js';

const program = new Command();

program
  .name('issue-badge')
  .description('Emitir badge SBT para um revisor')
  .requiredOption('-r, --reviewer <pubkey>', 'Public key do revisor')
  .requiredOption('-m, --mint <pubkey>', 'Endereço do mint do badge')
  .option('-l, --level <level>', 'Nível do revisor (1-5)', '1')
  .option('-s, --score <score>', 'Score de reputação', '0')
  .option('--specialties <specialties>', 'Especialidades (separadas por vírgula)', 'Research Review')
  .option('-d, --description <description>', 'Descrição personalizada do badge')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando emissão de badge SBT...');
      
      const reviewerPubkey = new PublicKey(options.reviewer);
      const mintPubkey = new PublicKey(options.mint);
      const level = parseInt(options.level);
      const score = parseInt(options.score);
      const specialties = options.specialties.split(',').map((s: string) => s.trim());
      
      // Validar inputs
      if (level < 1 || level > 5) {
        throw new Error('Nível deve estar entre 1 e 5');
      }
      
      if (score < 0) {
        throw new Error('Score deve ser não-negativo');
      }
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      console.log('📋 Configuração:');
      console.log(`   Revisor: ${reviewerPubkey.toString()}`);
      console.log(`   Mint: ${mintPubkey.toString()}`);
      console.log(`   Nível: ${level}`);
      console.log(`   Score: ${score}`);
      console.log(`   Especialidades: ${specialties.join(', ')}`);
      
      // Verificar se o mint existe
      const mintAccount = await connection.getAccountInfo(mintPubkey);
      if (!mintAccount) {
        throw new Error('Mint não encontrado. Verifique o endereço.');
      }
      
      // Verificar se o revisor já possui o badge
      const reviewerATA = await getAssociatedTokenAddress(
        mintPubkey,
        reviewerPubkey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const existingBalance = await connection.getTokenAccountBalance(reviewerATA).catch(() => null);
      if (existingBalance && parseInt(existingBalance.value.amount) > 0) {
        console.warn('⚠️  Revisor já possui este badge!');
        console.log(`   ATA: ${reviewerATA.toString()}`);
        console.log(`   Saldo atual: ${existingBalance.value.amount}`);
        
        if (!options.dryRun) {
          console.log('🔄 Atualizando badge existente...');
        }
      }
      
      // Criar metadata personalizada do badge
      const badgeMetadata: ReviewerBadgeMetadata = {
        level,
        score,
        specialties,
        issuedAt: new Date().toISOString(),
        description: options.description || `Badge de Revisor Nível ${level}`,
        imageUri: `https://arweave.net/badge-level-${level}-placeholder`
      };
      
      console.log('📤 Uploading metadata personalizada para Arweave...');
      const metadataResult = await uploadMetadataToArweave(badgeMetadata);
      console.log(`✅ Metadata URI: ${metadataResult.url}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`📄 Metadata seria criada em: ${metadataResult.url}`);
        console.log(`🎯 Badge seria emitido para: ${reviewerPubkey.toString()}`);
        console.log(`   ATA: ${reviewerATA.toString()}`);
        return;
      }
      
      // Criar transação
      const transaction = new (await import('@solana/web3.js')).Transaction();
      
      // 1. Criar ATA se não existir
      const ataExists = await accountExists(connection, reviewerATA);
      if (!ataExists) {
        console.log('📝 Criando ATA do revisor...');
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          keypair.publicKey, // payer
          reviewerATA, // ata
          reviewerPubkey, // owner
          mintPubkey, // mint
          TOKEN_2022_PROGRAM_ID
        );
        transaction.add(createATAInstruction);
      } else {
        console.log('✅ ATA já existe');
      }
      
      // 2. Mint 1 token para o revisor
      console.log('🎯 Mintando 1 token para o revisor...');
      const mintToInstruction = createMintToInstruction(
        mintPubkey, // mint
        reviewerATA, // destination
        keypair.publicKey, // authority
        1, // amount (sempre 1 para SBT)
        [], // multiSigners
        TOKEN_2022_PROGRAM_ID
      );
      transaction.add(mintToInstruction);
      
      // Enviar transação
      console.log('📤 Enviando transação...');
      const signature = await connection.sendTransaction(transaction, [keypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ Badge SBT emitido com sucesso!');
      console.log(`👤 Revisor: ${reviewerPubkey.toString()}`);
      console.log(`🎯 ATA: ${reviewerATA.toString()}`);
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Salvar informações da emissão
      const issueInfo = {
        reviewer: reviewerPubkey.toString(),
        mint: mintPubkey.toString(),
        ata: reviewerATA.toString(),
        level,
        score,
        specialties,
        metadataUri: metadataResult.url,
        signature,
        issuedAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações da Emissão:');
      console.log(JSON.stringify(issueInfo, null, 2));
      
      console.log('\n🎉 Badge SBT emitido com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Verifique a emissão no Solana Explorer');
      console.log('   2. Confirme que o token é não-transferível');
      console.log('   3. Notifique o revisor sobre o badge');
      console.log('   4. Atualize o sistema de reputação');
      
    } catch (error) {
      console.error('❌ Erro ao emitir badge:', error);
      process.exit(1);
    }
  });

program.parse();
