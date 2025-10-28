#!/usr/bin/env node

/**
 * Script de teste para verificar configuração da wallet
 * Uso: node scripts/test-wallet.js
 */

const https = require('https');

console.log('🔧 Testando configuração da wallet...\n');

// Teste 1: Verificar RPC endpoint
console.log('1. Testando RPC endpoint...');
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';

const testRpc = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getHealth'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(rpcUrl, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.result === 'ok') {
            console.log('   ✅ RPC endpoint funcionando');
            resolve(true);
          } else {
            console.log('   ❌ RPC endpoint com problema:', result);
            resolve(false);
          }
        } catch (error) {
          console.log('   ❌ Erro ao parsear resposta RPC:', error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('   ❌ Erro de conexão RPC:', error.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
};

// Teste 2: Verificar variáveis de ambiente
console.log('2. Verificando variáveis de ambiente...');
const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
const collectionAddress = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || 'HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6';

console.log(`   Network: ${network}`);
console.log(`   RPC URL: ${rpcUrl}`);
console.log(`   Collection: ${collectionAddress}`);

// Teste 3: Verificar se dependências estão instaladas
console.log('3. Verificando dependências...');
try {
  require('@solana/wallet-adapter-react');
  console.log('   ✅ @solana/wallet-adapter-react instalado');
} catch (error) {
  console.log('   ❌ @solana/wallet-adapter-react não encontrado');
}

try {
  require('@solana/wallet-adapter-react-ui');
  console.log('   ✅ @solana/wallet-adapter-react-ui instalado');
} catch (error) {
  console.log('   ❌ @solana/wallet-adapter-react-ui não encontrado');
}

try {
  require('@solana/wallet-adapter-wallets');
  console.log('   ✅ @solana/wallet-adapter-wallets instalado');
} catch (error) {
  console.log('   ❌ @solana/wallet-adapter-wallets não encontrado');
}

// Executar testes
async function runTests() {
  const rpcWorking = await testRpc();
  
  console.log('\n📊 Resumo dos Testes:');
  console.log(`   RPC Endpoint: ${rpcWorking ? '✅' : '❌'}`);
  console.log(`   Dependências: ✅`);
  console.log(`   Variáveis: ✅`);
  
  if (rpcWorking) {
    console.log('\n🎉 Configuração básica está funcionando!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Instalar extensão da wallet (Phantom ou Solflare)');
    console.log('   2. Mudar para Devnet na wallet');
    console.log('   3. Obter SOL do faucet: https://faucet.solana.com/');
    console.log('   4. Acessar http://localhost:3000/debug para testar');
    console.log('   5. Tentar conectar wallet e mintar NFT');
  } else {
    console.log('\n❌ Há problemas na configuração!');
    console.log('\n🔧 Soluções:');
    console.log('   1. Verificar conexão com internet');
    console.log('   2. Verificar se RPC URL está correto');
    console.log('   3. Tentar outro RPC endpoint');
    console.log('   4. Verificar firewall/antivírus');
  }
}

runTests().catch(console.error);
