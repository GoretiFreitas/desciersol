#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  createMetaplex, 
  depositLST
} from '../../lib/metaplex.js';

const program = new Command();

program
  .name('deposit-lst')
  .description('Depositar LSTs para financiar o pagamento de recompensas')
  .requiredOption('-a, --amount <amount>', 'Quantidade de LSTs para depositar')
  .requiredOption('-m, --mint <mint>', 'Mint address do LST (mSOL, jitoSOL, etc.)')
  .option('-v, --vault <vault>', 'Endereço do cofre (opcional)')
  .option('--dry-run', 'Simular transação sem executar')
  .option('-v, --verbose', 'Logs detalhados')
  .parse();

async function depositLSTToVault(options: any) {
  try {
    const { amount, mint, vault, dryRun, verbose } = options;
    
    if (verbose) {
      console.log('🔧 Configurando depósito de LST...');
      console.log(`   Quantidade: ${amount}`);
      console.log(`   Mint: ${mint}`);
      console.log(`   Vault: ${vault || 'PDA padrão'}`);
      console.log(`   Dry Run: ${dryRun}`);
    }

    // Validar inputs
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      throw new Error('Quantidade deve ser maior que 0');
    }

    const mintPubkey = new PublicKey(mint);

    // Carregar configuração
    const networkConfig = getCurrentNetworkConfig();
    const connection = createConnection();
    const keypair = loadKeypair();

    if (verbose) {
      console.log(`🌐 Rede: ${networkConfig.name}`);
      console.log(`🔗 RPC: ${networkConfig.rpcUrl}`);
      console.log(`👤 Autoridade: ${keypair.publicKey.toString()}`);
    }

    if (dryRun) {
      console.log('🔍 [DRY RUN] Simulando depósito de LST...');
      console.log(`   Quantidade: ${amountNum}`);
      console.log(`   Mint: ${mintPubkey.toString()}`);
      console.log(`   Vault: ${vault || 'PDA padrão'}`);
      console.log('✅ Simulação concluída - nenhuma transação foi executada');
      return;
    }

    // Criar metaplex instance
    const metaplex = createMetaplex(connection, keypair);

    // Determinar vault PDA
    let vaultPDA: PublicKey;
    if (vault) {
      vaultPDA = new PublicKey(vault);
    } else {
      // Usar PDA padrão baseado na autoridade
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), keypair.publicKey.toBuffer()],
        metaplex.programs().getTokenMetadata().address
      );
      vaultPDA = pda;
    }

    console.log(`🏦 Depositando ${amountNum} LSTs no cofre...`);
    console.log(`   Vault: ${vaultPDA.toString()}`);
    console.log(`   Mint: ${mintPubkey.toString()}`);

    // Depositar LST
    const depositResult = await depositLST(
      metaplex,
      vaultPDA,
      mintPubkey,
      amountNum
    );

    console.log('✅ LST depositado com sucesso!');
    console.log(`   Quantidade: ${amountNum}`);
    console.log(`   Mint: ${mintPubkey.toString()}`);
    console.log(`   Vault: ${vaultPDA.toString()}`);
    console.log(`   Signature: ${depositResult.signature}`);
    console.log(`   Explorer: ${getExplorerUrl(depositResult.signature)}`);

    // Salvar informações do depósito
    const depositInfo = {
      amount: amountNum,
      mint: mintPubkey.toString(),
      vault: vaultPDA.toString(),
      signature: depositResult.signature,
      network: networkConfig.name,
      depositedAt: new Date().toISOString(),
      depositor: keypair.publicKey.toString()
    };

    console.log('\n📋 Informações do Depósito:');
    console.log(JSON.stringify(depositInfo, null, 2));

    console.log('\n🎯 Próximos passos:');
    console.log('   1. Verificar saldo do cofre');
    console.log('   2. Configurar recompensas automáticas');
    console.log('   3. Integrar com sistema de revisão');

  } catch (error) {
    console.error('❌ Erro ao depositar LST:', error);
    process.exit(1);
  }
}

depositLSTToVault(program.opts());
