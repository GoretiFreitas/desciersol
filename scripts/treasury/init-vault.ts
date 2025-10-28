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
  createPDA,
  createVault
} from '../../lib/metaplex.js';

const program = new Command();

program
  .name('init-vault')
  .description('Inicializar o cofre de recompensas da sua comunidade')
  .option('-s, --initial-sol <sol>', 'SOL inicial para o cofre', '1.0')
  .option('-n, --name <name>', 'Nome do cofre', 'DeSci Reviews Treasury')
  .option('--dry-run', 'Simular transação sem executar')
  .option('-v, --verbose', 'Logs detalhados')
  .parse();

async function initVault(options: any) {
  try {
    const { initialSol, name, dryRun, verbose } = options;
    
    if (verbose) {
      console.log('🔧 Configurando inicialização do cofre...');
      console.log(`   Nome: ${name}`);
      console.log(`   SOL Inicial: ${initialSol}`);
      console.log(`   Dry Run: ${dryRun}`);
    }

    // Validar inputs
    const initialSolAmount = parseFloat(initialSol);
    if (initialSolAmount < 0) {
      throw new Error('SOL inicial deve ser maior ou igual a 0');
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
      console.log('🔍 [DRY RUN] Simulando inicialização do cofre...');
      console.log(`   Nome: ${name}`);
      console.log(`   SOL Inicial: ${initialSolAmount}`);
      console.log('✅ Simulação concluída - nenhuma transação foi executada');
      return;
    }

    // Criar metaplex instance
    const metaplex = createMetaplex(connection, keypair);

    // Criar PDA para o cofre
    console.log('🏦 Criando PDA para o cofre...');
    
    const vaultPDA = await createPDA(
      metaplex,
      [Buffer.from('treasury'), keypair.publicKey.toBuffer()]
    );

    console.log(`   Vault PDA: ${vaultPDA.toString()}`);

    // Criar cofre
    console.log('💰 Inicializando cofre...');
    
    const vault = await createVault(
      metaplex,
      vaultPDA,
      {
        name,
        description: `Cofre de recompensas para ${name}`,
        image: 'https://arweave.net/treasury-placeholder',
        attributes: [
          { trait_type: 'Type', value: 'Treasury Vault' },
          { trait_type: 'Network', value: networkConfig.name },
          { trait_type: 'Created', value: new Date().toISOString() }
        ]
      }
    );

    // Transferir SOL inicial se especificado
    if (initialSolAmount > 0) {
      console.log(`💸 Transferindo ${initialSolAmount} SOL para o cofre...`);
      
      const lamports = Math.floor(initialSolAmount * LAMPORTS_PER_SOL);
      
      const transferTx = await connection.transfer(
        keypair.publicKey,
        vaultPDA,
        lamports
      );

      console.log(`   Transfer Signature: ${transferTx}`);
    }

    console.log('✅ Cofre inicializado com sucesso!');
    console.log(`   Vault PDA: ${vaultPDA.toString()}`);
    console.log(`   SOL Inicial: ${initialSolAmount}`);
    console.log(`   Explorer: ${getExplorerUrl(vaultPDA.toString())}`);

    // Salvar informações do cofre
    const vaultInfo = {
      name,
      pda: vaultPDA.toString(),
      initialSol: initialSolAmount,
      network: networkConfig.name,
      createdAt: new Date().toISOString(),
      authority: keypair.publicKey.toString()
    };

    console.log('\n📋 Informações do Cofre:');
    console.log(JSON.stringify(vaultInfo, null, 2));

    console.log('\n🎯 Próximos passos:');
    console.log('   1. Depositar LSTs no cofre');
    console.log('   2. Configurar recompensas para revisores');
    console.log('   3. Integrar com sistema de pagamentos');

  } catch (error) {
    console.error('❌ Erro ao inicializar cofre:', error);
    process.exit(1);
  }
}

initVault(program.opts());
