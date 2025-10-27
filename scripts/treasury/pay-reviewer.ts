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
  .name('pay-reviewer')
  .description('Pagar revisor com LST do cofre de recompensas')
  .requiredOption('-r, --reviewer <pubkey>', 'Public key do revisor')
  .requiredOption('-a, --amount <amount>', 'Quantidade de LST para pagar')
  .requiredOption('-m, --mint <mint>', 'Endereço do mint do LST (mSOL, jitoSOL, etc.)')
  .option('--authority <pubkey>', 'Autoridade do cofre (padrão: wallet atual)')
  .option('-n, --note <note>', 'Nota/descrição do pagamento')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando pagamento para revisor...');
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      const authority = options.authority ? new PublicKey(options.authority) : keypair.publicKey;
      const reviewerPubkey = new PublicKey(options.reviewer);
      const mintPubkey = new PublicKey(options.mint);
      const amount = parseFloat(options.amount);
      
      console.log('📋 Configuração:');
      console.log(`   Revisor: ${reviewerPubkey.toString()}`);
      console.log(`   Quantidade: ${amount}`);
      console.log(`   Mint: ${mintPubkey.toString()}`);
      console.log(`   Autoridade: ${authority.toString()}`);
      if (options.note) console.log(`   Nota: ${options.note}`);
      
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
        console.log(`💰 ${amount} ${lstInfo?.[0] || 'LST'} seria transferido para o revisor`);
        console.log(`👤 Revisor: ${reviewerPubkey.toString()}`);
        console.log(`🎯 Cofre: ${vaultPDA.address.toString()}`);
        return;
      }
      
      // Verificar se o cofre existe
      const vaultExists = await accountExists(connection, vaultPDA.address);
      if (!vaultExists) {
        throw new Error('Cofre não existe. Execute init-vault primeiro.');
      }
      
      // Obter ATAs
      const vaultATA = await getAssociatedTokenAddress(mintPubkey, vaultPDA.address);
      const reviewerATA = await getAssociatedTokenAddress(mintPubkey, reviewerPubkey);
      
      console.log(`🏦 ATA do Cofre: ${vaultATA.toString()}`);
      console.log(`👤 ATA do Revisor: ${reviewerATA.toString()}`);
      
      // Verificar se a ATA do cofre existe
      const vaultATAExists = await accountExists(connection, vaultATA);
      if (!vaultATAExists) {
        throw new Error('ATA do cofre não existe. O cofre possui este LST?');
      }
      
      // Verificar saldo do cofre
      const vaultBalance = await connection.getTokenAccountBalance(vaultATA);
      const availableAmount = parseFloat(vaultBalance.value.amount) / Math.pow(10, vaultBalance.value.decimals);
      
      console.log(`💰 Saldo disponível no cofre: ${availableAmount}`);
      
      if (availableAmount < amount) {
        throw new Error(`Saldo insuficiente no cofre. Disponível: ${availableAmount}, Solicitado: ${amount}`);
      }
      
      // Verificar se a ATA do revisor existe
      const reviewerATAExists = await accountExists(connection, reviewerATA);
      if (!reviewerATAExists) {
        console.log('📝 ATA do revisor não existe. Será criada automaticamente.');
      }
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`💰 ${amount} ${lstInfo?.[0] || 'LST'} seria transferido para o revisor`);
        console.log(`👤 ATA de destino: ${reviewerATA.toString()}`);
        return;
      }
      
      // Criar transação
      const transaction = new (await import('@solana/web3.js')).Transaction();
      
      // 1. Criar ATA do revisor se não existir
      if (!reviewerATAExists) {
        console.log('📝 Criando ATA do revisor...');
        const { createAssociatedTokenAccountInstruction } = await import('@solana/spl-token');
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          keypair.publicKey, // payer
          reviewerATA, // ata
          reviewerPubkey, // owner
          mintPubkey, // mint
        );
        transaction.add(createATAInstruction);
      }
      
      // 2. Transferir LST do cofre para o revisor
      console.log(`💸 Transferindo ${amount} LST para o revisor...`);
      const transferAmount = Math.floor(amount * Math.pow(10, vaultBalance.value.decimals));
      
      const transferInstruction = createTransferInstruction(
        vaultATA, // source
        reviewerATA, // destination
        authority, // authority (será assinada pelo keypair)
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
      
      console.log('✅ Pagamento realizado com sucesso!');
      console.log(`👤 Revisor: ${reviewerPubkey.toString()}`);
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Verificar saldo final do revisor
      const finalReviewerBalance = await connection.getTokenAccountBalance(reviewerATA);
      const finalAmount = parseFloat(finalReviewerBalance.value.amount) / Math.pow(10, finalReviewerBalance.value.decimals);
      
      console.log(`💰 Saldo final do revisor: ${finalAmount} ${lstInfo?.[0] || 'LST'}`);
      
      // Salvar informações do pagamento
      const paymentInfo = {
        reviewer: reviewerPubkey.toString(),
        amount,
        mint: mintPubkey.toString(),
        lstType: lstInfo?.[0] || 'Unknown',
        vault: vaultPDA.address.toString(),
        reviewerATA: reviewerATA.toString(),
        note: options.note || '',
        signature,
        paidAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 Informações do Pagamento:');
      console.log(JSON.stringify(paymentInfo, null, 2));
      
      console.log('\n🎉 Pagamento realizado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Verificar o pagamento no Solana Explorer');
      console.log('   2. Notificar o revisor sobre o pagamento');
      console.log('   3. Atualizar sistema de contabilidade');
      console.log('   4. Registrar transação para auditoria');
      
    } catch (error) {
      console.error('❌ Erro ao pagar revisor:', error);
      process.exit(1);
    }
  });

program.parse();
