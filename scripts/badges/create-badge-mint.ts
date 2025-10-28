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
  createTokenMint,
  MetaplexNFTMetadata 
} from '../../lib/metaplex.js';

const program = new Command();

program
  .name('create-badge-mint')
  .description('Criar o token que servirá como base para os badges de revisor')
  .option('-n, --name <name>', 'Nome do badge de revisor', 'Badge de Revisor')
  .option('-s, --symbol <symbol>', 'Símbolo do token', 'BADGE')
  .option('-d, --description <description>', 'Descrição do badge', 'Badge de reputação para revisores')
  .option('--dry-run', 'Simular transação sem executar')
  .option('-v, --verbose', 'Logs detalhados')
  .parse();

async function createBadgeMint(options: any) {
  try {
    const { name, symbol, description, dryRun, verbose } = options;
    
    if (verbose) {
      console.log('🔧 Configurando criação de badge mint...');
      console.log(`   Nome: ${name}`);
      console.log(`   Símbolo: ${symbol}`);
      console.log(`   Descrição: ${description}`);
      console.log(`   Dry Run: ${dryRun}`);
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
      console.log('🔍 [DRY RUN] Simulando criação de badge mint...');
      console.log(`   Token: ${name} (${symbol})`);
      console.log(`   Descrição: ${description}`);
      console.log('✅ Simulação concluída - nenhuma transação foi executada');
      return;
    }

    // Criar metaplex instance
    const metaplex = createMetaplex(connection, keypair);

    // Criar token mint para badge
    console.log('🪙 Criando token mint para badge...');
    
    const tokenMint = await createTokenMint(
      metaplex,
      {
        name,
        symbol,
        description,
        image: 'https://arweave.net/badge-placeholder', // Placeholder image
        attributes: [
          { trait_type: 'Type', value: 'Reviewer Badge' },
          { trait_type: 'Network', value: networkConfig.name },
          { trait_type: 'Created', value: new Date().toISOString() }
        ]
      }
    );

    console.log('✅ Badge mint criado com sucesso!');
    console.log(`   Token Mint: ${tokenMint.address.toString()}`);
    console.log(`   Explorer: ${getExplorerUrl(tokenMint.address.toString())}`);

    // Salvar informações do badge
    const badgeInfo = {
      name,
      symbol,
      description,
      mint: tokenMint.address.toString(),
      network: networkConfig.name,
      createdAt: new Date().toISOString(),
      authority: keypair.publicKey.toString()
    };

    console.log('\n📋 Informações do Badge:');
    console.log(JSON.stringify(badgeInfo, null, 2));

    console.log('\n🎯 Próximos passos:');
    console.log('   1. Use o mint address para emitir badges');
    console.log('   2. Configure níveis de reputação');
    console.log('   3. Integre com sistema de revisão');

  } catch (error) {
    console.error('❌ Erro ao criar badge mint:', error);
    process.exit(1);
  }
}

createBadgeMint(program.opts());
