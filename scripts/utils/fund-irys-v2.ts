#!/usr/bin/env tsx

/**
 * Fazer fund do Irys V2 para uploads no Arweave
 */

import { Command } from 'commander';
import { createConnection } from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  createIrysUploader,
  fundIrysV2,
  getIrysBalanceV2
} from '../../lib/irys-uploader-v2.js';

const program = new Command();

program
  .name('fund-irys-v2')
  .description('Fazer fund da conta Irys V2 para uploads no Arweave')
  .option('-a, --amount <amount>', 'Quantidade de SOL para depositar')
  .option('--mainnet', 'Usar mainnet ao invés de devnet')
  .option('--check-balance', 'Apenas verificar saldo')
  .action(async (options) => {
    try {
      console.log('💰 Gerenciamento de Saldo Irys V2\n');
      
      const keypair = loadKeypair();
      const useDevnet = !options.mainnet;
      
      console.log(`🌐 Rede: ${useDevnet ? 'devnet' : 'mainnet'}`);
      console.log(`👤 Wallet: ${keypair.publicKey.toString()}`);
      
      // Criar uploader
      const uploader = await createIrysUploader(keypair, useDevnet);
      
      // Verificar saldo
      const currentBalance = await getIrysBalanceV2(uploader);
      console.log(`💰 Saldo atual no Irys: ${currentBalance.toFixed(6)} SOL`);
      
      if (options.checkBalance) {
        console.log('\n✅ Verificação de saldo concluída');
        return;
      }
      
      if (!options.amount) {
        console.log('\n⚠️  Especifique --amount para fazer fund');
        console.log('   Exemplo: --amount 0.1');
        return;
      }
      
      // Fazer fund
      const amount = parseFloat(options.amount);
      
      if (amount <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      
      console.log(`\n💸 Fazendo fund de ${amount} SOL...`);
      await fundIrysV2(uploader, amount);
      
      console.log('\n🎉 Fund concluído!');
      console.log('💡 Próximos passos:');
      console.log('   1. Execute uploads sem --use-placeholder');
      console.log('   2. Metadata será armazenada permanentemente');
      console.log('   3. URLs serão acessíveis via https://arweave.net/');
      
    } catch (error) {
      console.error('❌ Erro:', error);
      process.exit(1);
    }
  });

program.parse();
