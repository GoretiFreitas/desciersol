#!/usr/bin/env tsx

/**
 * Exemplo de uso do Ar.io (Arweave) para storage
 */

import {
  uploadToArweave,
  uploadMetadataToArweave,
  calculateSHA256,
  calculateSHA256FromData,
  verifyArweaveFile,
  getArweaveMetadata,
  estimateUploadCost,
  validateFileSize,
  formatArweaveUrl,
  extractTxIdFromUrl,
  ARIO_CONFIG
} from '../../lib/ario-storage.js';

async function arioExample() {
  console.log('🌐 Exemplo de integração com Ar.io (Arweave)\n');
  
  // 1. Gateways disponíveis
  console.log('📡 Gateways Ar.io disponíveis:');
  Object.entries(ARIO_CONFIG.gateways).forEach(([name, url]) => {
    console.log(`   ${name}: ${url}`);
  });
  
  // 2. Upload de metadata
  console.log('\n📤 Exemplo de upload de metadata:');
  const researchMetadata = {
    title: 'Machine Learning Protocol for Medical Imaging',
    authors: ['Dr. Alice Silva', 'Dr. Bob Santos'],
    abstract: 'Novel approach to automated diagnosis using deep learning',
    keywords: ['machine learning', 'medical imaging', 'diagnosis'],
    version: '1.0.0',
    license: 'CC-BY-4.0',
    doi: '10.1234/example.2024.001',
    publishedAt: new Date().toISOString()
  };
  
  const metadataResult = await uploadMetadataToArweave(researchMetadata, {
    'Data-Protocol': 'research-asset',
    'Data-Version': '1.0'
  });
  
  console.log('\n✅ Metadata uploaded:');
  console.log(`   ID: ${metadataResult.id}`);
  console.log(`   URL: ${metadataResult.url}`);
  console.log(`   Hash: ${metadataResult.hash}`);
  console.log(`   Size: ${metadataResult.size} bytes`);
  
  // 3. Calcular hash de dados
  console.log('\n🔐 Calculando hash SHA-256:');
  const data = JSON.stringify(researchMetadata);
  const hash = calculateSHA256FromData(data);
  console.log(`   Hash: ${hash}`);
  
  // 4. Estimar custo de upload
  console.log('\n💰 Estimativa de custos:');
  const sizes = [
    { name: 'Metadata (1 KB)', size: 1024 },
    { name: 'Paper PDF (5 MB)', size: 5 * 1024 * 1024 },
    { name: 'Dataset (50 MB)', size: 50 * 1024 * 1024 }
  ];
  
  sizes.forEach(({ name, size }) => {
    const cost = estimateUploadCost(size);
    const costUSD = cost * 50; // Assumindo 1 AR = $50
    console.log(`   ${name}: ~${cost.toFixed(6)} AR (~$${costUSD.toFixed(4)} USD)`);
  });
  
  // 5. Validar tamanho de arquivo
  console.log('\n✅ Validação de tamanhos:');
  console.log(`   Metadata (10 KB): ${validateFileSize(10 * 1024, true) ? '✓' : '✗'}`);
  console.log(`   Paper (5 MB): ${validateFileSize(5 * 1024 * 1024) ? '✓' : '✗'}`);
  console.log(`   Dataset (200 MB): ${validateFileSize(200 * 1024 * 1024) ? '✓' : '✗'}`);
  
  // 6. Formatar URLs
  console.log('\n🔗 Formatação de URLs:');
  const txId = 'example_tx_id_12345';
  const urls = Object.entries(ARIO_CONFIG.gateways).map(([name, gateway]) => ({
    name,
    url: formatArweaveUrl(txId, gateway)
  }));
  
  urls.forEach(({ name, url }) => {
    console.log(`   ${name}: ${url}`);
  });
  
  // 7. Extrair TX ID de URL
  console.log('\n🔍 Extrair transaction ID:');
  const testUrls = [
    'https://arweave.net/abc123def456',
    'https://ar-io.net/xyz789/metadata.json'
  ];
  
  testUrls.forEach(url => {
    const txId = extractTxIdFromUrl(url);
    console.log(`   URL: ${url}`);
    console.log(`   TX ID: ${txId || 'não encontrado'}`);
  });
  
  // 8. Exemplo de workflow completo
  console.log('\n📋 Workflow completo de upload:');
  console.log(`
// 1. Preparar metadata
const metadata = {
  title: "Meu Paper",
  authors: ["Alice", "Bob"],
  fileHash: calculateSHA256("./paper.pdf")
};

// 2. Upload de metadata
const metadataUpload = await uploadMetadataToArweave(metadata, {
  'Content-Type': 'application/json',
  'Data-Protocol': 'research-asset'
});

// 3. Upload do arquivo
const fileUpload = await uploadToArweave('./paper.pdf', {
  'Content-Type': 'application/pdf',
  'File-Name': 'paper.pdf'
});

// 4. Criar asset NFT com URLs do Arweave
const asset = {
  metadataUri: metadataUpload.url,
  fileUri: fileUpload.url,
  fileHash: fileUpload.hash
};

// 5. Verificar upload
const isValid = await verifyArweaveFile(metadataUpload.id);
console.log('Upload válido:', isValid);
  `);
  
  console.log('\n🎯 Próximos passos:');
  console.log('   1. Instalar @irys/sdk para uploads reais');
  console.log('   2. Configurar wallet Arweave');
  console.log('   3. Implementar retry logic para uploads');
  console.log('   4. Adicionar progresso de upload');
  console.log('   5. Implementar cache de metadata');
  
  console.log('\n💡 Para implementar upload real:');
  console.log('   npm install @irys/sdk arweave');
  console.log('   Consultar: https://docs.irys.xyz/');
}

arioExample();
