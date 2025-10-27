/**
 * Irys Upload V2 - Usando nova API @irys/upload
 * Suporta devnet e mainnet
 * Referência: https://docs.irys.xyz/build/d/sdk/setup#solana
 */

import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';
import { Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import bs58 from 'bs58';

/**
 * Resultado de upload Irys
 */
export interface IrysUploadResult {
  id: string;
  url: string;
  hash: string;
  size: number;
  timestamp: number;
}

/**
 * Criar Irys Uploader para Solana
 * Para devnet, usa .withRpc() e .devnet()
 */
export async function createIrysUploader(
  keypair: Keypair,
  useDevnet: boolean = true
) {
  console.log(`🌐 Inicializando Irys Uploader (${useDevnet ? 'devnet' : 'mainnet'})...`);
  
  // Converter keypair para formato base58 (esperado pelo Irys)
  const privateKey = bs58.encode(keypair.secretKey);
  
  // Criar uploader
  // Para devnet, usar método correto
  let uploader;
  
  if (useDevnet) {
    uploader = await Uploader(Solana)
      .withWallet(privateKey)
      .withRpc('https://api.devnet.solana.com')
      .devnet();
    
    console.log('✅ Configurado para devnet');
  } else {
    uploader = await Uploader(Solana).withWallet(privateKey);
    console.log('✅ Configurado para mainnet');
  }
  
  console.log('✅ Irys Uploader inicializado');
  
  return uploader;
}

/**
 * Upload de dados (string ou Buffer) para Arweave
 */
export async function uploadData(
  uploader: any,
  data: string | Buffer,
  tags?: Record<string, string>
): Promise<IrysUploadResult> {
  console.log('📤 Uploading dados para Arweave via Irys...');
  
  // Preparar tags
  const irysTag = tags ? Object.entries(tags).map(([name, value]) => ({
    name,
    value
  })) : [];
  
  console.log('🏷️  Tags:', tags || {});
  
  try {
    // Upload
    const receipt = await uploader.upload(data, { tags: irysTag });
    
    // Calcular hash
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const hash = createHash('sha256').update(dataBuffer).digest('hex');
    
    const result: IrysUploadResult = {
      id: receipt.id,
      url: `https://gateway.irys.xyz/${receipt.id}`,
      hash: `sha256:${hash}`,
      size: dataBuffer.length,
      timestamp: Date.now(),
    };
    
    console.log('✅ Upload concluído!');
    console.log(`   ID: ${result.id}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Arweave URL: https://arweave.net/${result.id}`);
    console.log(`   Size: ${result.size} bytes`);
    
    return result;
  } catch (error) {
    console.error('❌ Erro no upload Irys:', error);
    throw error;
  }
}

/**
 * Upload de metadata JSON para Arweave
 */
export async function uploadMetadataToIrysV2(
  uploader: any,
  metadata: Record<string, any>,
  tags?: Record<string, string>
): Promise<IrysUploadResult> {
  console.log('📤 Uploading metadata para Arweave via Irys V2...');
  
  // Converter para JSON string
  const metadataString = JSON.stringify(metadata);
  
  console.log('📄 Metadata:');
  console.log(metadataString);
  
  // Preparar tags
  const allTags = {
    'Content-Type': 'application/json',
    'App-Name': 'Solana Research Assets',
    'App-Version': '1.0.0',
    ...tags
  };
  
  return await uploadData(uploader, metadataString, allTags);
}

/**
 * Upload de arquivo para Arweave
 */
export async function uploadFileToIrysV2(
  uploader: any,
  filePath: string,
  tags?: Record<string, string>
): Promise<IrysUploadResult> {
  console.log(`📤 Uploading arquivo para Arweave via Irys V2...`);
  console.log(`📁 Arquivo: ${filePath}`);
  
  // Ler arquivo
  const fileData = readFileSync(filePath);
  
  return await uploadData(uploader, fileData, tags);
}

/**
 * Calcular hash SHA-256 de um arquivo
 */
export function calculateFileSHA256(filePath: string): string {
  try {
    const fileBuffer = readFileSync(filePath);
    const hashSum = createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error('Erro ao calcular hash:', error);
    throw new Error(`Não foi possível calcular hash do arquivo: ${filePath}`);
  }
}

/**
 * Obter saldo do Irys (novo SDK)
 */
export async function getIrysBalanceV2(uploader: any): Promise<number> {
  try {
    const balance = await uploader.getBalance();
    // Converter de atomic units para SOL
    return Number(balance) / 1e9;
  } catch (error) {
    console.warn('⚠️  Erro ao obter saldo Irys:', error);
    return 0;
  }
}

/**
 * Fazer fund do Irys
 */
export async function fundIrysV2(uploader: any, amountInSOL: number): Promise<void> {
  console.log(`💰 Funding Irys com ${amountInSOL} SOL...`);
  
  try {
    const amountAtomic = Math.floor(amountInSOL * 1e9);
    const receipt = await uploader.fund(amountAtomic);
    
    console.log('✅ Fund concluído!');
    console.log(`   TX: ${receipt.id}`);
    
    // Verificar novo saldo
    const newBalance = await getIrysBalanceV2(uploader);
    console.log(`💰 Novo saldo: ${newBalance.toFixed(6)} SOL`);
  } catch (error) {
    console.error('❌ Erro ao fazer fund:', error);
    throw error;
  }
}

/**
 * Estimar custo de upload
 */
export async function estimateUploadCost(uploader: any, sizeInBytes: number): Promise<number> {
  try {
    const price = await uploader.getPrice(sizeInBytes);
    return Number(price) / 1e9; // Converter para SOL
  } catch (error) {
    console.warn('⚠️  Erro ao estimar custo:', error);
    return 0;
  }
}
