/**
 * Script para converter keypair.json para formato base58
 * Útil para configurar IRYS_PRIVATE_KEY no frontend
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import bs58 from 'bs58';

const KEYPAIR_PATH = process.env.KEYPAIR_PATH || './keypair.json';

function convertKeypairToBase58(keypairPath: string): string {
  try {
    console.log(`📂 Lendo keypair de: ${keypairPath}`);
    
    const keypairData = readFileSync(keypairPath, 'utf-8');
    const keypairArray = JSON.parse(keypairData);
    
    if (!Array.isArray(keypairArray) || keypairArray.length !== 64) {
      throw new Error('Formato de keypair inválido. Esperado array de 64 bytes.');
    }
    
    const secretKey = Uint8Array.from(keypairArray);
    const base58Key = bs58.encode(secretKey);
    
    console.log('✅ Conversão concluída!\n');
    console.log('📋 Adicione esta linha ao seu frontend/.env.local:\n');
    console.log(`IRYS_PRIVATE_KEY=${base58Key}\n`);
    console.log('⚠️  IMPORTANTE: Nunca commite esta chave no git!');
    console.log('   Adicione .env.local ao .gitignore\n');
    
    return base58Key;
  } catch (error) {
    console.error('❌ Erro ao converter keypair:', error);
    throw error;
  }
}

// Executar
try {
  const keypairPath = resolve(process.cwd(), KEYPAIR_PATH);
  convertKeypairToBase58(keypairPath);
} catch (error) {
  console.error('Erro:', error instanceof Error ? error.message : error);
  process.exit(1);
}

