#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig,
  getExplorerUrl 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  createMetaplex, 
  mintToken,
  createTokenAccount
} from '../../lib/metaplex.js';

const program = new Command();

program
  .name('issue-badge')
  .description('Emitir um badge para um revisor específico')
  .requiredOption('-r, --reviewer <pubkey>', 'Public key do revisor')
  .requiredOption('-m, --mint <mint>', 'Endereço do mint do badge')
  .option('-l, --level <level>', 'Nível do badge (1-5)', '1')
  .option('-a, --amount <amount>', 'Quantidade do badge', '1')
  .option('--dry-run', 'Simular transação sem executar')
  .option('-v, --verbose', 'Logs detalhados')
  .parse();

async function issueBadge(options: any) {
  try {
    const { reviewer, mint, level, amount, dryRun, verbose } = options;
    
    if (verbose) {
      console.log('🔧 Configurando emissão de badge...');
      console.log(`   Revisor: ${reviewer}`);
      console.log(`   Mint: ${mint}`);
      console.log(`   Nível: ${level}`);
      console.log(`   Quantidade: ${amount}`);
      console.log(`   Dry Run: ${dryRun}`);
    }

    // Validar inputs
    const reviewerPubkey = new PublicKey(reviewer);
    const mintPubkey = new PublicKey(mint);
    const levelNum = parseInt(level);
    const amountNum = parseInt(amount);

    if (levelNum < 1 || levelNum > 5) {
      throw new Error('Nível do badge deve estar entre 1 e 5');
    }

    if (amountNum < 1) {
      throw new Error('Quantidade deve ser maior que 0');
    }

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
      console.log('🔍 [DRY RUN] Simulando emissão de badge...');
      console.log(`   Revisor: ${reviewerPubkey.toString()}`);
      console.log(`   Mint: ${mintPubkey.toString()}`);
      console.log(`   Nível: ${levelNum}`);
      console.log(`   Quantidade: ${amountNum}`);
      console.log('✅ Simulação concluída - nenhuma transação foi executada');
      return;
    }

    // Criar metaplex instance
    const metaplex = createMetaplex(connection, keypair);

    // Criar token account para o revisor se não existir
    console.log('🏦 Criando/verificando token account do revisor...');
    
    const tokenAccount = await createTokenAccount(
      metaplex,
      reviewerPubkey,
      mintPubkey
    );

    console.log(`   Token Account: ${tokenAccount.toString()}`);

    // Mintar tokens para o revisor
    console.log('🪙 Emitindo badge para o revisor...');
    
    const mintResult = await mintToken(
      metaplex,
      mintPubkey,
      tokenAccount,
      amountNum
    );

    console.log('✅ Badge emitido com sucesso!');
    console.log(`   Revisor: ${reviewerPubkey.toString()}`);
    console.log(`   Token Account: ${tokenAccount.toString()}`);
    console.log(`   Quantidade: ${amountNum}`);
    console.log(`   Nível: ${levelNum}`);
    console.log(`   Explorer: ${getExplorerUrl(mintResult.signature)}`);

    // Salvar informações da emissão
    const badgeIssue = {
      reviewer: reviewerPubkey.toString(),
      mint: mintPubkey.toString(),
      tokenAccount: tokenAccount.toString(),
      level: levelNum,
      amount: amountNum,
      signature: mintResult.signature,
      network: networkConfig.name,
      issuedAt: new Date().toISOString(),
      issuer: keypair.publicKey.toString()
    };

    console.log('\n📋 Informações da Emissão:');
    console.log(JSON.stringify(badgeIssue, null, 2));

    console.log('\n🎯 Próximos passos:');
    console.log('   1. Verificar badge no explorer');
    console.log('   2. Integrar com sistema de reputação');
    console.log('   3. Configurar permissões baseadas no nível');

  } catch (error) {
    console.error('❌ Erro ao emitir badge:', error);
    process.exit(1);
  }
}

issueBadge(program.opts());
