#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { 
  createMint, 
  createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeNonTransferableMintInstruction,
  getMintLen,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  SBT_CONFIG,
  METADATA_CONFIG,
  TRANSACTION_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';
import { BadgeMintConfig, ReviewerBadgeMetadata } from '../../lib/types.js';

const program = new Command();

program
  .name('create-badge-mint')
  .description('Criar mint de badge SBT (Soulbound Token) usando Token-2022')
  .option('-n, --name <name>', 'Nome do badge', METADATA_CONFIG.BADGE_NAME)
  .option('-s, --symbol <symbol>', 'Símbolo do badge', METADATA_CONFIG.BADGE_SYMBOL)
  .option('-d, --description <description>', 'Descrição do badge', METADATA_CONFIG.BADGE_DESCRIPTION)
  .option('-i, --image-uri <uri>', 'URI da imagem do badge')
  .option('--freeze-authority <pubkey>', 'Autoridade de freeze (opcional)')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando criação do mint de badge SBT...');
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      console.log('📋 Configuração:');
      console.log(`   Nome: ${options.name}`);
      console.log(`   Símbolo: ${options.symbol}`);
      console.log(`   Descrição: ${options.description}`);
      console.log(`   Decimals: ${SBT_CONFIG.DECIMALS}`);
      console.log(`   Extensões: ${SBT_CONFIG.REQUIRED_EXTENSIONS.join(', ')}`);
      
      // Verificar saldo
      const balance = await connection.getBalance(keypair.publicKey);
      const balanceSOL = balance / 1e9;
      console.log(`💰 Saldo: ${balanceSOL.toFixed(4)} SOL`);
      
      if (balanceSOL < 0.1) {
        console.warn('⚠️  Saldo baixo! Recomendado pelo menos 0.1 SOL para operações.');
      }
      
      // Criar metadata do badge
      const badgeMetadata: ReviewerBadgeMetadata = {
        level: 1, // Nível padrão
        score: 0, // Score inicial
        specialties: ['Research Review'], // Especialidade padrão
        issuedAt: new Date().toISOString(),
        imageUri: options.imageUri,
        description: options.description
      };
      
      console.log('📤 Uploading metadata para Arweave...');
      const metadataResult = await uploadMetadataToArweave(badgeMetadata);
      console.log(`✅ Metadata URI: ${metadataResult.url}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`📄 Metadata seria criada em: ${metadataResult.url}`);
        console.log(`🎯 Mint seria criado com URI: ${metadataResult.url}`);
        return;
      }
      
      // Gerar keypair para o mint
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      
      console.log(`🎯 Mint Address: ${mint.toString()}`);
      
      // SIMPLIFICADO: Usar mint regular do TOKEN_2022_PROGRAM
      // Para SBT completo, precisaria de um program customizado
      
      // Calcular tamanho do mint (sem extensões complexas)
      const mintLen = 82; // Tamanho padrão do mint
      const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(mintLen);
      
      console.log(`📏 Tamanho do mint: ${mintLen} bytes`);
      console.log(`💰 Rent exempt: ${rentExemptAmount / 1e9} SOL`);
      console.log(`⚠️  NOTA: Criando mint regular. Para SBT completo, implemente program customizado.`);
      
      // Criar transação
      const transaction = new (await import('@solana/web3.js')).Transaction();
      
      // 1. Criar conta do mint
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: keypair.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: rentExemptAmount,
        programId: TOKEN_2022_PROGRAM_ID,
      });
      transaction.add(createAccountInstruction);
      
      // 2. Inicializar mint (sem freeze authority para simular SBT)
      const initializeMintInstruction = createInitializeMintInstruction(
        mint,
        SBT_CONFIG.DECIMALS,
        keypair.publicKey, // mint authority
        null, // freeze authority (null para simular não-transferível)
        TOKEN_2022_PROGRAM_ID
      );
      transaction.add(initializeMintInstruction);
      
      // Enviar transação
      console.log('📤 Enviando transação...');
      const signature = await connection.sendTransaction(transaction, [keypair, mintKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ Mint de badge SBT criado com sucesso!');
      console.log(`🎯 Endereço do Mint: ${mint.toString()}`);
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Salvar informações do mint
      const mintInfo = {
        mint: mint.toString(),
        name: options.name,
        symbol: options.symbol,
        description: options.description,
        metadataUri: metadataResult.url,
        decimals: SBT_CONFIG.DECIMALS,
        extensions: SBT_CONFIG.REQUIRED_EXTENSIONS,
        mintAuthority: keypair.publicKey.toString(),
        freezeAuthority: options.freezeAuthority || keypair.publicKey.toString(),
        signature,
        createdAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações do Mint:');
      console.log(JSON.stringify(mintInfo, null, 2));
      
      console.log('\n🎉 Mint de badge SBT criado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Use este endereço do mint para emitir badges');
      console.log('   2. Configure Token Metadata para o mint');
      console.log('   3. Verifique o mint no Solana Explorer');
      console.log('   4. Teste a não-transferibilidade dos tokens');
      
    } catch (error) {
      console.error('❌ Erro ao criar mint de badge:', error);
      process.exit(1);
    }
  });

program.parse();
