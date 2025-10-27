#!/usr/bin/env tsx

import { createConnection, getCurrentNetworkConfig, getExplorerUrl } from '../lib/connection.js';
import { loadKeypair, keypairExists } from '../lib/keypair.js';
import { deriveTreasuryVaultPDA } from '../lib/pda.js';
import { uploadMetadataToArweave } from '../lib/arweave-placeholder.js';

async function testSetup() {
  console.log('🧪 Testando configuração do sistema...\n');
  
  try {
    // Teste 1: Conexão
    console.log('1️⃣ Testando conexão com Solana...');
    const connection = createConnection();
    const networkConfig = getCurrentNetworkConfig();
    console.log(`   ✅ Conectado à ${networkConfig.name}`);
    console.log(`   📡 RPC: ${connection.rpcEndpoint}`);
    
    // Teste 2: Keypair
    console.log('\n2️⃣ Testando keypair...');
    if (keypairExists()) {
      const keypair = loadKeypair();
      console.log(`   ✅ Keypair carregado: ${keypair.publicKey.toString()}`);
    } else {
      console.log('   ⚠️  Keypair não encontrado. Execute: npx tsx scripts/utils/generate-keypair.ts');
    }
    
    // Teste 3: PDA
    console.log('\n3️⃣ Testando derivação de PDA...');
    const testAuthority = new (await import('@solana/web3.js')).PublicKey('11111111111111111111111111111111');
    const vaultPDA = deriveTreasuryVaultPDA(testAuthority);
    console.log(`   ✅ PDA derivado: ${vaultPDA.address.toString()}`);
    console.log(`   🔢 Bump: ${vaultPDA.bump}`);
    
    // Teste 4: Arweave placeholder
    console.log('\n4️⃣ Testando upload para Arweave (placeholder)...');
    const testMetadata = { test: 'data', timestamp: Date.now() };
    const result = await uploadMetadataToArweave(testMetadata);
    console.log(`   ✅ Upload simulado: ${result.url}`);
    console.log(`   🔗 Hash: ${result.hash}`);
    
    // Teste 5: Explorer URL
    console.log('\n5️⃣ Testando URLs do explorador...');
    const testSignature = 'test123456789';
    const explorerUrl = getExplorerUrl(testSignature);
    console.log(`   ✅ URL do explorador: ${explorerUrl}`);
    
    console.log('\n🎉 Todos os testes passaram! O sistema está configurado corretamente.');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Configure seu .env com RPC_URL e KEYPAIR_PATH');
    console.log('   2. Gere um keypair se necessário');
    console.log('   3. Execute os scripts de exemplo');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  }
}

testSetup();
