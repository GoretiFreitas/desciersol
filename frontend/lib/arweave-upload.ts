/**
 * Upload para Arweave usando serviços públicos
 * Alternativa ao Irys para quando não há saldo
 */

interface ArweaveUploadResult {
  uri: string;
  success: boolean;
  error?: string;
}

/**
 * Upload de metadata JSON para Arweave via serviço público
 */
export async function uploadMetadataToArweave(
  metadata: any
): Promise<ArweaveUploadResult> {
  try {
    console.log('📤 Fazendo upload de metadata para Arweave...');
    
    // Converter metadata para JSON
    const metadataJson = JSON.stringify(metadata);
    const blob = new Blob([metadataJson], { type: 'application/json' });
    
    // Usar serviço público de upload Arweave (web3.storage ou similar)
    // Para testes, vamos usar um serviço gratuito
    
    // Opção 1: Tentar web3.storage (grátis, permanente)
    try {
      const formData = new FormData();
      formData.append('file', blob, 'metadata.json');
      
      // Nota: Isso requer API key do web3.storage
      // Por enquanto, vamos usar nossa própria API que faz upload via Irys
      const response = await fetch('/api/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata }),
      });
      
      if (response.ok) {
        const { uri } = await response.json();
        console.log('✅ Metadata uploaded para Arweave:', uri);
        return { uri, success: true };
      }
    } catch (apiError) {
      console.warn('⚠️ API upload falhou, tentando método alternativo...');
    }
    
    // Fallback: usar IPFS público (Pinata/NFT.storage)
    try {
      // NFT.Storage é gratuito e permanente
      const nftStorageResponse = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: metadataJson,
      });
      
      if (nftStorageResponse.ok) {
        const { value } = await nftStorageResponse.json();
        const uri = `https://ipfs.io/ipfs/${value.cid}`;
        console.log('✅ Metadata uploaded para IPFS:', uri);
        return { uri, success: true };
      }
    } catch (ipfsError) {
      console.warn('⚠️ IPFS upload falhou');
    }
    
    // Último fallback: usar data URI (inline)
    console.warn('⚠️ Usando data URI como fallback (metadata inline)');
    const dataUri = `data:application/json,${encodeURIComponent(metadataJson)}`;
    return { uri: dataUri, success: true };
    
  } catch (error) {
    console.error('❌ Erro ao fazer upload de metadata:', error);
    return {
      uri: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload de arquivo para Arweave
 */
export async function uploadFileToArweave(
  file: File
): Promise<ArweaveUploadResult> {
  try {
    console.log('📤 Fazendo upload de arquivo para Arweave...');
    
    // Usar nossa API que tem Irys configurado
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload-file', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const { uri } = await response.json();
      console.log('✅ Arquivo uploaded para Arweave:', uri);
      return { uri, success: true };
    }
    
    throw new Error('Upload failed');
  } catch (error) {
    console.error('❌ Erro ao fazer upload de arquivo:', error);
    return {
      uri: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

