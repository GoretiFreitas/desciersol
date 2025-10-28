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
  payReviewer
} from '../../lib/metaplex.js';

const program = new Command();

program
  .name('pay-reviewer')
  .description('Pagar um revisor por seu trabalho')
  .requiredOption('-r, --reviewer <reviewer>', 'Public key do revisor')
  .requiredOption('-a, --amount <amount>', 'Quantidade a pagar')
  .requiredOption('-m, --mint <mint>', 'Mint do token para pagamento')
  .option('-v, --vault <vault>', 'Endereço do cofre (opcional)')
  .option('--reason <reason>', 'Motivo do pagamento', 'Revisão de paper')
  .option('--dry-run', 'Simular transação sem executar')
  .option('-v, --verbose', 'Logs detalhados')
  .parse();

async function payReviewerReward(options: any) {
  try {
    const { reviewer, amount, mint, vault, reason, dryRun, verbose } = options;
    
    if (verbose) {
      console.log('🔧 Configurando pagamento de revisor...');
      console.log(`   Revisor: ${reviewer}`);
      console.log(`   Quantidade: ${amount}`);
      console.log(`   Mint: ${mint}`);
      console.log(`   Vault: ${vault || 'PDA padrão'}`);
      console.log(`   Motivo: ${reason}`);
      console.log(`   Dry Run: ${dryRun}`);
    }

    // Validar inputs
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      throw new Error('Quantidade deve ser maior que 0');
    }

    const reviewerPubkey = new PublicKey(reviewer);
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
      console.log('🔍 [DRY RUN] Simulando pagamento de revisor...');
      console.log(`   Revisor: ${reviewerPubkey.toString()}`);
      console.log(`   Quantidade: ${amountNum}`);
      console.log(`   Mint: ${mintPubkey.toString()}`);
      console.log(`   Vault: ${vault || 'PDA padrão'}`);
      console.log(`   Motivo: ${reason}`);
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

    console.log(`💰 Pagando revisor...`);
    console.log(`   Revisor: ${reviewerPubkey.toString()}`);
    console.log(`   Quantidade: ${amountNum}`);
    console.log(`   Mint: ${mintPubkey.toString()}`);
    console.log(`   Vault: ${vaultPDA.toString()}`);
    console.log(`   Motivo: ${reason}`);

    // Pagar revisor
    const paymentResult = await payReviewer(
      metaplex,
      vaultPDA,
      reviewerPubkey,
      mintPubkey,
      amountNum,
      reason
    );

    console.log('✅ Revisor pago com sucesso!');
    console.log(`   Revisor: ${reviewerPubkey.toString()}`);
    console.log(`   Quantidade: ${amountNum}`);
    console.log(`   Mint: ${mintPubkey.toString()}`);
    console.log(`   Signature: ${paymentResult.signature}`);
    console.log(`   Explorer: ${getExplorerUrl(paymentResult.signature)}`);

    // Salvar informações do pagamento
    const paymentInfo = {
      reviewer: reviewerPubkey.toString(),
      amount: amountNum,
      mint: mintPubkey.toString(),
      vault: vaultPDA.toString(),
      reason,
      signature: paymentResult.signature,
      network: networkConfig.name,
      paidAt: new Date().toISOString(),
      payer: keypair.publicKey.toString()
    };

    console.log('\n📋 Informações do Pagamento:');
    console.log(JSON.stringify(paymentInfo, null, 2));

    console.log('\n🎯 Próximos passos:');
    console.log('   1. Verificar saldo do revisor');
    console.log('   2. Atualizar reputação do revisor');
    console.log('   3. Registrar pagamento no sistema');

  } catch (error) {
    console.error('❌ Erro ao pagar revisor:', error);
    process.exit(1);
  }
}

payReviewerReward(program.opts());
