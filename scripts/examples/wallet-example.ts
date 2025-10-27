#!/usr/bin/env tsx

/**
 * Exemplo de uso do Wallet Adapter com Solflare
 * 
 * NOTA: Este script é para uso em ambiente browser.
 * Para executar, integre com um frontend Next.js ou similar.
 */

import { 
  detectAvailableWallets,
  connectSolflare,
  disconnectWallet,
  getWalletAdapter,
  isWalletConnected,
  getWalletPublicKey,
  SUPPORTED_WALLETS
} from '../../lib/wallet-adapter.js';

async function walletExample() {
  console.log('🔐 Exemplo de integração com Solflare Wallet\n');
  
  console.log('📋 Wallets suportadas:');
  Object.entries(SUPPORTED_WALLETS).forEach(([key, wallet]) => {
    console.log(`   - ${wallet.name}: ${wallet.url}`);
  });
  
  console.log('\n💡 Para usar este exemplo:');
  console.log('   1. Instale a extensão Solflare: https://solflare.com');
  console.log('   2. Execute este código em um ambiente browser');
  console.log('   3. Conecte sua wallet quando solicitado\n');
  
  // Exemplo de código para frontend
  console.log('📝 Código de exemplo para frontend:\n');
  console.log(`
// Detectar wallets disponíveis
const wallets = detectAvailableWallets();
console.log('Wallets disponíveis:', wallets);

// Conectar com Solflare
try {
  const publicKey = await connectSolflare();
  console.log('Conectado! Public Key:', publicKey.toString());
  
  // Verificar se está conectado
  if (isWalletConnected('solflare')) {
    console.log('✅ Wallet conectada');
    
    // Obter public key
    const pk = getWalletPublicKey('solflare');
    console.log('Public Key:', pk?.toString());
    
    // Obter adapter para assinar transações
    const adapter = getWalletAdapter('solflare');
    if (adapter) {
      // Usar adapter para assinar transações
      const signedTx = await adapter.signTransaction(transaction);
    }
  }
  
  // Desconectar
  await disconnectWallet('solflare');
  console.log('Desconectado');
  
} catch (error) {
  console.error('Erro:', error);
}
  `);
  
  console.log('\n🎯 Próximos passos:');
  console.log('   1. Integrar com frontend Next.js');
  console.log('   2. Usar @solana/wallet-adapter-react para React');
  console.log('   3. Adicionar UI para conectar/desconectar wallet');
}

walletExample();
