#!/usr/bin/env tsx

import { generateAndSaveKeypair } from '../../lib/keypair.js';

console.log('🔑 Gerando novo keypair...\n');

try {
  const keypair = generateAndSaveKeypair('./keypair.json');
  
  console.log('\n✅ Keypair gerado com sucesso!');
  console.log('\n📋 Informações:');
  console.log(`   Public Key: ${keypair.publicKey.toString()}`);
  console.log(`   Arquivo: ./keypair.json`);
  
  console.log('\n💡 Próximos passos:');
  console.log('   1. Configure KEYPAIR_PATH=./keypair.json no seu .env');
  console.log('   2. Faça airdrop de SOL na Devnet se necessário');
  console.log('   3. Execute os scripts de exemplo');
  
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - Mantenha o arquivo keypair.json seguro');
  console.log('   - Nunca compartilhe este arquivo');
  console.log('   - Use apenas para desenvolvimento/testes');
  
} catch (error) {
  console.error('❌ Erro ao gerar keypair:', error);
  process.exit(1);
}
