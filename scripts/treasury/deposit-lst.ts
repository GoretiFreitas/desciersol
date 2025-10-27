#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl,
  accountExists,
  getAccountBalance 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  TREASURY_CONFIG,
  TRANSACTION_CONFIG 
} from '../../lib/constants.js';
import { deriveTreasuryVaultPDA } from '../../lib/pda.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

const program = new Command();

program
  .name('deposit-lst')
  .description('Depositar LST no cofre de recompensas')
  .requiredOption('-a, --amount <amount>', 'Quantidade de LST para depositar')
  .requiredOption('-m, --mint <mint>', 'Endereço do mint do LST (mSOL, jitoSOL, etc.)')
  .option('--authority <pubkey>', 'Autoridade do cofre (padrão: wallet atual)')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando depósito de LST no cofre...');
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      const authority = options.authority ? new PublicKey(options.authority) : keypair.publicKey;
      const mintPubkey = new PublicKey(options.mint);
      const amount = parseFloat(options.amount);
      
      console.log('📋 Configuração:');
      console.log(`   Quantidade: ${amount}`);
      console.log(`   Mint: ${mintPubkey.toString()}`);
      console.log(`   Autoridade: ${authority.toString()}`);
      
      // Verificar se o mint é um LST conhecido
      const knownLSTs = Object.entries(networkConfig.lstMints);
      const lstInfo = knownLSTs.find(([name, mint]) => (mint as PublicKey).equals(mintPubkey));
      if (lstInfo) {
        console.log(`✅ LST reconhecido: ${lstInfo[0]}`);
      } else {
        console.log('⚠️  LST não reconhecido. Continuando mesmo assim...');
      }
      
      // Derivar PDA do cofre
      const vaultPDA = deriveTreasuryVaultPDA(authority);
      console.log(`🎯 Cofre: ${vaultPDA.address.toString()}`);
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`💰 ${amount} ${lstInfo?.[0] || 'LST'} seria transferido para o cofre`);
        console.log(`🎯 Cofre: ${vaultPDA.address.toString()}`);
        return;
      }
      
      // Verificar se o cofre existe
      const vaultExists = await accountExists(connection, vaultPDA.address);
      if (!vaultExists) {
        throw new Error('Cofre não existe. Execute init-vault primeiro.');
      }
      
      // Obter ATAs
      const depositorATA = await getAssociatedTokenAddress(mintPubkey, keypair.publicKey);
      const vaultATA = await getAssociatedTokenAddress(mintPubkey, vaultPDA.address);
      
      console.log(`👤 ATA do Depositante: ${depositorATA.toString()}`);
      console.log(`🏦 ATA do Cofre: ${vaultATA.toString()}`);
      
      // Verificar se as ATAs existem
      const depositorATAExists = await accountExists(connection, depositorATA);
      if (!depositorATAExists) {
        throw new Error('ATA do depositante não existe. Você possui este LST?');
      }
      
      // Verificar saldo do depositante
      const depositorBalance = await connection.getTokenAccountBalance(depositorATA);
      const availableAmount = parseFloat(depositorBalance.value.amount) / Math.pow(10, depositorBalance.value.decimals);
      
      console.log(`💰 Saldo disponível: ${availableAmount}`);
      
      if (availableAmount < amount) {
        throw new Error(`Saldo insuficiente. Disponível: ${availableAmount}, Solicitado: ${amount}`);
      }
      
      // Verificar se a ATA do cofre existe
      const vaultATAExists = await accountExists(connection, vaultATA);
      if (!vaultATAExists) {
        console.log('📝 ATA do cofre não existe. Será criada automaticamente.');
      }
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`💰 ${amount} ${lstInfo?.[0] || 'LST'} seria transferido para o cofre`);
        console.log(`🎯 ATA de destino: ${vaultATA.toString()}`);
        return;
      }
      
      // Criar transação
      const transaction = new (await import('@solana/web3.js')).Transaction();
      
      // 1. Criar ATA do cofre se não existir
      if (!vaultATAExists) {
        console.log('📝 Criando ATA do cofre...');
        const { createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          keypair.publicKey, // payer
          vaultATA, // ata
          vaultPDA.address, // owner
          mintPubkey, // mint
        );
        transaction.add(createATAInstruction);
      }
      
      // 2. Transferir LST para o cofre
      console.log(`💸 Transferindo ${amount} LST para o cofre...`);
      const transferAmount = Math.floor(amount * Math.pow(10, depositorBalance.value.decimals));
      
      const transferInstruction = createTransferInstruction(
        depositorATA, // source
        vaultATA, // destination
        keypair.publicKey, // authority
        transferAmount, // amount
      );
      transaction.add(transferInstruction);
      
      // Enviar transação
      console.log('📤 Enviando transação...');
      const signature = await connection.sendTransaction(transaction, [keypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ LST depositado com sucesso!');
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Verificar saldo final do cofre
      const finalVaultBalance = await connection.getTokenAccountBalance(vaultATA);
      const finalAmount = parseFloat(finalVaultBalance.value.amount) / Math.pow(10, finalVaultBalance.value.decimals);
      
      console.log(`💰 Saldo final do cofre: ${finalAmount} ${lstInfo?.[0] || 'LST'}`);
      
      // Salvar informações do depósito
      const depositInfo = {
        vault: vaultPDA.address.toString(),
        mint: mintPubkey.toString(),
        amount,
        lstType: lstInfo?.[0] || 'Unknown',
        depositor: keypair.publicKey.toString(),
        vaultATA: vaultATA.toString(),
        signature,
        depositedAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações do Depósito:');
      console.log(JSON.stringify(depositInfo, null, 2));
      
      console.log('\n🎉 LST depositado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Verificar o depósito no Solana Explorer');
      console.log('   2. Configurar yield farming se disponível');
      console.log('   3. Preparar distribuição de recompensas');
      console.log('   4. Monitorar performance do LST');
      
    } catch (error) {
      console.error('❌ Erro ao depositar LST:', error);
      process.exit(1);
    }
  });

program.parse();
