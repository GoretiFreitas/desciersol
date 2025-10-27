import { Keypair, PublicKey } from '@solana/web3.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

/**
 * Carregar keypair do arquivo especificado
 */
export function loadKeypair(): Keypair {
  const keypairPath = process.env.KEYPAIR_PATH || './keypair.json';
  
  try {
    const keypairData = readFileSync(keypairPath, 'utf8');
    const secretKey = JSON.parse(keypairData);
    
    if (!Array.isArray(secretKey) || secretKey.length !== 64) {
      throw new Error('Formato inválido do keypair. Deve ser um array de 64 números.');
    }
    
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
  } catch (error) {
    console.error('Erro ao carregar keypair:', error);
    throw new Error(`Não foi possível carregar o keypair de ${keypairPath}. Verifique se o arquivo existe e tem o formato correto.`);
  }
}

/**
 * Gerar um novo keypair e salvar no arquivo
 */
export function generateAndSaveKeypair(filePath: string = './keypair.json'): Keypair {
  const keypair = Keypair.generate();
  
  try {
    const secretKeyArray = Array.from(keypair.secretKey);
    const keypairData = JSON.stringify(secretKeyArray, null, 2);
    
    writeFileSync(filePath, keypairData);
    
    console.log(`✅ Novo keypair gerado e salvo em: ${filePath}`);
    console.log(`📋 Public Key: ${keypair.publicKey.toString()}`);
    console.log(`⚠️  IMPORTANTE: Mantenha este arquivo seguro e nunca o compartilhe!`);
    
    return keypair;
  } catch (error) {
    console.error('Erro ao salvar keypair:', error);
    throw new Error(`Não foi possível salvar o keypair em ${filePath}`);
  }
}

/**
 * Verificar se o keypair existe
 */
export function keypairExists(filePath?: string): boolean {
  const path = filePath || process.env.KEYPAIR_PATH || './keypair.json';
  
  try {
    return existsSync(path);
  } catch {
    return false;
  }
}

/**
 * Obter a public key do keypair carregado
 */
export function getPublicKey(): PublicKey {
  const keypair = loadKeypair();
  return keypair.publicKey;
}
