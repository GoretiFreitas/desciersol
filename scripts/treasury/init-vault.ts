#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
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

const program = new Command();

program
  .name('init-vault')
  .description('Inicializar PDA do cofre de recompensas')
  .option('-a, --authority <pubkey>', 'Autoridade do cofre (padrão: wallet atual)')
  .option('-s, --seed <seed>', 'Seed customizado para o PDA', TREASURY_CONFIG.VAULT_SEED)
  .option('--initial-sol <amount>', 'Quantidade inicial de SOL para depositar', '0')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando inicialização do cofre de recompensas...');
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      const authority = options.authority ? new PublicKey(options.authority) : keypair.publicKey;
      const initialSOL = parseFloat(options.initialSol);
      
      console.log('📋 Configuração:');
      console.log(`   Autoridade: ${authority.toString()}`);
      console.log(`   Seed: ${options.seed}`);
      console.log(`   SOL inicial: ${initialSOL}`);
      
      // Criar keypair para o cofre (ao invés de usar PDA)
      // NOTA: Em produção, use PDA com um program customizado
      const vaultKeypair = Keypair.generate();
      const vaultAddress = vaultKeypair.publicKey;
      
      console.log(`🎯 Endereço do Cofre: ${vaultAddress.toString()}`);
      console.log(`⚠️  NOTA: Usando keypair regular. Em produção, use PDA com program.`);
      
      // Verificar se o cofre já existe
      const vaultExists = await accountExists(connection, vaultAddress);
      if (vaultExists) {
        console.log('✅ Cofre já existe!');
        const balance = await getAccountBalance(connection, vaultAddress);
        console.log(`💰 Saldo atual: ${balance.toFixed(4)} SOL`);
        
        if (initialSOL > 0) {
          console.log('💸 Depositando SOL adicional...');
        } else {
          console.log('ℹ️  Nenhuma ação necessária');
          return;
        }
      }
      
      // Verificar saldo da autoridade
      const authorityBalance = await getAccountBalance(connection, authority);
      console.log(`💰 Saldo da autoridade: ${authorityBalance.toFixed(4)} SOL`);
      
      const totalNeeded = initialSOL + 0.001; // + rent exempt
      
      if (options.dryRun) {
        console.log('🔍 [DRY RUN] Transação não executada');
        console.log(`🎯 Cofre seria criado em: ${vaultAddress.toString()}`);
        console.log(`💰 SOL inicial seria: ${initialSOL}`);
        return;
      }
      
      if (authorityBalance < totalNeeded) {
        throw new Error(`Saldo insuficiente. Necessário: ${totalNeeded} SOL, Disponível: ${authorityBalance} SOL`);
      }
      
      // Criar transação
      const transaction = new (await import('@solana/web3.js')).Transaction();
      
      // 1. Criar conta do cofre com SOL inicial
      console.log('📝 Criando conta do cofre...');
      const rentExempt = await connection.getMinimumBalanceForRentExemption(0);
      const totalLamports = rentExempt + Math.floor(initialSOL * LAMPORTS_PER_SOL);
      
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: authority,
        newAccountPubkey: vaultAddress,
        space: 0, // Conta simples, sem dados
        lamports: totalLamports,
        programId: SystemProgram.programId,
      });
      transaction.add(createAccountInstruction);
      
      // Enviar transação
      console.log('📤 Enviando transação...');
      const signature = await connection.sendTransaction(transaction, [keypair, vaultKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('⏳ Aguardando confirmação...');
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ Cofre inicializado com sucesso!');
      console.log(`🎯 Endereço do Cofre: ${vaultAddress.toString()}`);
      console.log(`📝 Signature: ${signature}`);
      console.log(`🔍 Explorer: ${getExplorerUrl(signature)}`);
      
      // Verificar saldo final
      const finalBalance = await getAccountBalance(connection, vaultAddress);
      console.log(`💰 Saldo final: ${finalBalance.toFixed(4)} SOL`);
      
      // Salvar informações do cofre
      const vaultInfo = {
        address: vaultAddress.toString(),
        authority: authority.toString(),
        initialSOL,
        currentBalance: finalBalance,
        signature,
        createdAt: new Date().toISOString(),
        network: networkConfig.name,
        note: 'Cofre criado com keypair regular. Para produção, implemente program com PDA.'
      };
      
      console.log('\n📋 Informações do Cofre:');
      console.log(JSON.stringify(vaultInfo, null, 2));
      
      console.log('\n🎉 Cofre inicializado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Depositar LSTs no cofre');
      console.log('   2. Configurar distribuição de recompensas');
      console.log('   3. Verificar o cofre no Solana Explorer');
      console.log('   4. Implementar lógica de governance');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar cofre:', error);
      process.exit(1);
    }
  });

program.parse();
