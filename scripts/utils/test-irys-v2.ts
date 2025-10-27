#!/usr/bin/env tsx

/**
 * Testar upload real com Irys V2 (nova API)
 */

import { loadKeypair } from '../../lib/keypair.js';
import { 
  createIrysUploader,
  uploadMetadataToIrysV2,
  getIrysBalanceV2,
  estimateUploadCost,
  fundIrysV2
} from '../../lib/irys-uploader-v2.js';

async function testIrysV2() {
  console.log('🧪 Testando Irys V2 (nova API com devnet)\n');
  
  try {
    // Carregar keypair
    const keypair = loadKeypair();
    console.log(`👤 Wallet: ${keypair.publicKey.toString()}`);
    
    // Criar uploader para devnet
    console.log('\n1️⃣ Criando Irys Uploader...');
    const uploader = await createIrysUploader(keypair, true); // true = devnet
    
    // Verificar saldo
    console.log('\n2️⃣ Verificando saldo...');
    const balance = await getIrysBalanceV2(uploader);
    console.log(`💰 Saldo Irys: ${balance.toFixed(6)} SOL`);
    
    // Estimar custo de upload
    console.log('\n3️⃣ Estimando custo...');
    const testMetadata = {
      name: "Test NFT",
      description: "Teste de upload Irys",
      image: "https://example.com/image.png"
    };
    const metadataSize = Buffer.from(JSON.stringify(testMetadata)).length;
    const cost = await estimateUploadCost(uploader, metadataSize);
    
    console.log(`📊 Tamanho da metadata: ${metadataSize} bytes`);
    console.log(`💰 Custo estimado: ${cost.toFixed(8)} SOL`);
    
    // Verificar se tem saldo suficiente
    if (balance < cost) {
      console.log(`\n⚠️  Saldo insuficiente para upload!`);
      console.log(`   Necessário: ${cost.toFixed(8)} SOL`);
      console.log(`   Disponível: ${balance.toFixed(8)} SOL`);
      console.log(`\n💡 Para fazer fund:`);
      console.log(`   npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01`);
      return;
    }
    
    // Fazer upload de teste
    console.log('\n4️⃣ Fazendo upload de teste...');
    const uploadResult = await uploadMetadataToIrysV2(uploader, testMetadata, {
      'Test': 'true',
      'Network': 'devnet'
    });
    
    console.log('\n✅ Upload concluído com sucesso!');
    console.log(`🌐 URL Irys Gateway: ${uploadResult.url}`);
    console.log(`🌐 URL Arweave: https://arweave.net/${uploadResult.id}`);
    console.log(`🔐 Hash: ${uploadResult.hash}`);
    
    console.log('\n🎉 Teste concluído! Irys V2 está funcionando!');
    console.log('\n💡 Você pode agora:');
    console.log('   1. Usar mint-research-asset-metaplex-irys.ts sem --use-placeholder');
    console.log('   2. Metadata será REAL e acessível publicamente');
    console.log('   3. URLs funcionarão em wallets e marketplaces');
    
  } catch (error) {
    console.error('❌ Erro no teste Irys V2:', error);
    
    if ((error as Error).message?.includes('devnet')) {
      console.log('\n💡 Sugestão:');
      console.log('   - Irys devnet pode ter problemas de configuração');
      console.log('   - Tente usar mainnet com valores pequenos');
      console.log('   - Ou use upload manual via https://irys.xyz/upload');
    }
    
    process.exit(1);
  }
}

testIrysV2();
