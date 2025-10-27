/**
 * Turbo (ArDrive) Upload Integration
 * Upload para Arweave usando Turbo - mais simples e confiável
 * Referência: https://docs.ar.io/build/upload/bundling-services
 */

import { TurboFactory, ArweaveSigner } from '@ardrive/turbo-sdk';
import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

/**
 * Resultado de upload Turbo
 */
export interface TurboUploadResult {
  id: string;
  url: string;
  hash: string;
  size: number;
  timestamp: number;
  owner: string;
}

/**
 * Converter Solana Keypair para JWK (Arweave format)
 * NOTA: Turbo usa wallets Arweave (JWK), não Solana keypairs diretamente
 * Para usar com Solana, precisamos de uma wallet Arweave separada
 */
export function solanaKeypairToArweaveJWK(keypair: Keypair): any {
  // Turbo requer JWK format (Arweave wallet)
  // Para usar com Solana, você tem duas opções:
  // 1. Criar wallet Arweave separada
  // 2. Pagar com SOL via SDK
  
  console.warn('⚠️  Turbo usa wallets Arweave (JWK). Para Solana, use topUpWithTokens()');
  
  // Placeholder - em produção, use wallet Arweave real
  return {
    kty: 'RSA',
    n: 'placeholder',
    e: 'AQAB',
    d: 'placeholder'
  };
}

/**
 * Criar cliente Turbo autenticado
 * @param jwkPath - Caminho para arquivo JWK da wallet Arweave
 */
export async function createTurboClient(jwkPath?: string) {
  console.log('🌐 Inicializando Turbo (ArDrive)...');
  
  if (jwkPath) {
    // Usar wallet Arweave (JWK)
    const jwk = JSON.parse(readFileSync(jwkPath, 'utf-8'));
    const signer = new ArweaveSigner(jwk);
    
    const turbo = TurboFactory.authenticated({ signer });
    console.log('✅ Turbo autenticado com JWK');
    
    return turbo;
  } else {
    // Usar modo não autenticado (pode fazer fund com SOL depois)
    const turbo = TurboFactory.unauthenticated();
    console.log('✅ Turbo não autenticado (use topUpWithTokens para funding)');
    
    return turbo;
  }
}

/**
 * Upload de dados para Arweave via Turbo
 */
export async function uploadDataToTurbo(
  turbo: any,
  data: string | Buffer,
  tags?: Record<string, string>
): Promise<TurboUploadResult> {
  console.log('📤 Uploading dados para Arweave via Turbo...');
  
  // Preparar tags
  const turboTags = tags ? Object.entries(tags).map(([name, value]) => ({
    name,
    value
  })) : [];
  
  // Adicionar Content-Type se não especificado
  if (!tags || !tags['Content-Type']) {
    turboTags.push({
      name: 'Content-Type',
      value: typeof data === 'string' ? 'application/json' : 'application/octet-stream'
    });
  }
  
  console.log('🏷️  Tags:', tags || {});
  
  try {
    // Upload
    const result = await turbo.upload({
      data,
      dataItemOpts: {
        tags: turboTags,
      },
    });
    
    // Calcular hash
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const hash = createHash('sha256').update(dataBuffer).digest('hex');
    
    const uploadResult: TurboUploadResult = {
      id: result.id,
      url: `https://arweave.net/${result.id}`,
      hash: `sha256:${hash}`,
      size: dataBuffer.length,
      timestamp: Date.now(),
      owner: result.owner || 'unknown'
    };
    
    console.log('✅ Upload concluído!');
    console.log(`   ID: ${uploadResult.id}`);
    console.log(`   URL: ${uploadResult.url}`);
    console.log(`   Size: ${uploadResult.size} bytes`);
    console.log(`   Owner: ${uploadResult.owner}`);
    
    return uploadResult;
  } catch (error) {
    console.error('❌ Erro no upload Turbo:', error);
    throw error;
  }
}

/**
 * Upload de metadata JSON para Arweave via Turbo
 */
export async function uploadMetadataToTurbo(
  turbo: any,
  metadata: Record<string, any>,
  tags?: Record<string, string>
): Promise<TurboUploadResult> {
  console.log('📤 Uploading metadata para Arweave via Turbo...');
  console.log('📄 Metadata:', JSON.stringify(metadata, null, 2));
  
  // Converter para JSON string
  const metadataString = JSON.stringify(metadata);
  
  // Preparar tags
  const allTags = {
    'Content-Type': 'application/json',
    'App-Name': 'Solana Research Assets',
    'App-Version': '1.0.0',
    ...tags
  };
  
  return await uploadDataToTurbo(turbo, metadataString, allTags);
}

/**
 * Upload de arquivo para Arweave via Turbo
 */
export async function uploadFileToTurbo(
  turbo: any,
  filePath: string,
  tags?: Record<string, string>
): Promise<TurboUploadResult> {
  console.log(`📤 Uploading arquivo para Arweave via Turbo...`);
  console.log(`📁 Arquivo: ${filePath}`);
  
  // Ler arquivo
  const fileData = readFileSync(filePath);
  
  return await uploadDataToTurbo(turbo, fileData, tags);
}

/**
 * Verificar saldo de Turbo Credits
 */
export async function getTurboBalance(turbo: any): Promise<number> {
  try {
    const balance = await turbo.getBalance();
    // Winston Credits (winc)
    const wincBalance = Number(balance.winc);
    // Converter para SOL aproximado (1 AR ≈ 150 SOL aproximadamente)
    const solEquivalent = wincBalance / 1e12 * 150;
    
    console.log(`💰 Saldo Turbo: ${wincBalance} Winston Credits`);
    console.log(`   (~${solEquivalent.toFixed(6)} SOL equivalente)`);
    
    return wincBalance;
  } catch (error) {
    console.warn('⚠️  Erro ao obter saldo Turbo:', error);
    return 0;
  }
}

/**
 * Fazer top-up com tokens SOL
 * Referência: https://docs.ar.io/build/upload/bundling-services
 */
export async function topUpWithSOL(
  turbo: any,
  amountInSOL: number
): Promise<void> {
  console.log(`💰 Top-up Turbo com ${amountInSOL} SOL...`);
  
  try {
    const result = await turbo.topUpWithTokens({
      tokenAmount: amountInSOL,
      tokenType: 'solana',
    });
    
    console.log('✅ Top-up concluído!');
    console.log(`   Credits adicionados: ${result.winc} winc`);
    console.log(`   TX: ${result.id}`);
  } catch (error) {
    console.error('❌ Erro ao fazer top-up:', error);
    throw error;
  }
}

/**
 * Estimar custo de upload em Winston Credits
 */
export async function estimateTurboCost(turbo: any, sizeInBytes: number): Promise<number> {
  try {
    const cost = await turbo.getUploadCost(sizeInBytes);
    return Number(cost.winc);
  } catch (error) {
    console.warn('⚠️  Erro ao estimar custo:', error);
    // Estimativa aproximada: ~1 winc por byte
    return sizeInBytes;
  }
}

/**
 * Calcular hash SHA-256 de dados
 */
export function calculateSHA256Hash(data: string | Buffer): string {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return createHash('sha256').update(buffer).digest('hex');
}
