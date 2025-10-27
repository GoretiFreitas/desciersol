#!/usr/bin/env tsx

/**
 * Testar upload com Turbo (ArDrive)
 * Mais simples que Irys, suporta SOL diretamente
 */

import {
  createTurboClient,
  uploadMetadataToTurbo,
  getTurboBalance,
  estimateTurboCost
} from '../../lib/turbo-uploader.js';

async function testTurbo() {
  console.log('🧪 Testando Turbo (ArDrive) Upload\n');
  
  try {
    // Criar cliente Turbo (não autenticado - pode fazer top-up com SOL)
    console.log('1️⃣ Criando Turbo client...');
    const turbo = await createTurboClient();
    
    // Metadata de teste
    const testMetadata = {
      name: "Test NFT Turbo",
      description: "Teste de upload com Turbo SDK",
      image: "https://example.com/image.png",
      attributes: [
        {
          trait_type: "Test",
          value: "true"
        }
      ]
    };
    
    const metadataSize = Buffer.from(JSON.stringify(testMetadata)).length;
    console.log(`📊 Tamanho da metadata: ${metadataSize} bytes`);
    
    // Estimar custo
    console.log('\n2️⃣ Estimando custo...');
    const cost = await estimateTurboCost(turbo, metadataSize);
    console.log(`💰 Custo estimado: ${cost} Winston Credits`);
    
    // Verificar saldo
    console.log('\n3️⃣ Verificando saldo...');
    const balance = await getTurboBalance(turbo);
    
    if (balance < cost) {
      console.log(`\n⚠️  Saldo insuficiente para upload!`);
      console.log(`   Necessário: ${cost} winc`);
      console.log(`   Disponível: ${balance} winc`);
      console.log(`\n💡 Para fazer top-up:`);
      console.log(`   1. Via web: https://turbo-topup.com`);
      console.log(`   2. Via SDK: npx tsx scripts/utils/topup-turbo.ts --amount 0.01`);
      console.log(`\n   Aceita: SOL, ETH, USDC, AR, MATIC, ARIO`);
      return;
    }
    
    // Fazer upload
    console.log('\n4️⃣ Fazendo upload...');
    const uploadResult = await uploadMetadataToTurbo(turbo, testMetadata, {
      'Test': 'true',
      'Network': 'devnet'
    });
    
    console.log('\n✅ Upload concluído com sucesso!');
    console.log(`🌐 URL: ${uploadResult.url}`);
    console.log(`🔐 Hash: ${uploadResult.hash}`);
    console.log(`👤 Owner: ${uploadResult.owner}`);
    
    console.log('\n🎉 Teste concluído! Turbo está funcionando!');
    console.log('\n💡 Você pode agora:');
    console.log('   1. Fazer top-up via https://turbo-topup.com (aceita SOL!)');
    console.log('   2. Usar scripts com --use-turbo');
    console.log('   3. Metadata será REAL e permanente');
    
  } catch (error) {
    console.error('❌ Erro no teste Turbo:', error);
    console.log('\n💡 Soluções:');
    console.log('   1. Faça top-up em https://turbo-topup.com');
    console.log('   2. Ou use --use-placeholder para testes');
    console.log('   3. Ou use Irys: npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01');
    
    process.exit(1);
  }
}

testTurbo();
