#!/usr/bin/env tsx

import { Command } from 'commander';
import { PublicKey } from '@solana/web3.js';
import { 
  createConnection, 
  getCurrentNetworkConfig 
} from '../../lib/connection.js';
import { loadKeypair } from '../../lib/keypair.js';
import { 
  VALIDATION_CONFIG 
} from '../../lib/constants.js';
import { uploadMetadataToArweave } from '../../lib/arweave-placeholder.js';
import { 
  createMetaplex, 
  updateNFT,
  getNFT,
  MetaplexNFTMetadata 
} from '../../lib/metaplex.js';

const program = new Command();

program
  .name('update-asset-metaplex')
  .description('Atualizar metadata de um NFT de pesquisa usando Metaplex')
  .requiredOption('-m, --mint <pubkey>', 'Mint address do NFT a ser atualizado')
  .option('-n, --name <name>', 'Novo nome do NFT')
  .option('-s, --symbol <symbol>', 'Novo símbolo do NFT')
  .option('-u, --uri <uri>', 'Nova URI da metadata')
  .option('--dry-run', 'Apenas simular, não executar transação')
  .action(async (options) => {
    try {
      console.log('🚀 Iniciando atualização de NFT (Metaplex)...');
      
      const mintAddress = new PublicKey(options.mint);
      console.log(`🎯 NFT Mint: ${mintAddress.toString()}`);
      
      // Configurar conexão
      const connection = createConnection();
      const networkConfig = getCurrentNetworkConfig();
      const keypair = loadKeypair();
      
      // Verificar saldo
      const balance = await connection.getBalance(keypair.publicKey);
      const balanceSOL = balance / 1e9;
      console.log(`💰 Saldo: ${balanceSOL.toFixed(4)} SOL`);
      
      // Criar instância do Metaplex
      const metaplex = createMetaplex(connection, keypair);
      
      // Buscar NFT atual
      console.log('🔍 Buscando NFT...');
      const nft = await getNFT(metaplex, mintAddress);
      
      console.log('📋 NFT Atual:');
      console.log(`   Nome: ${nft.name}`);
      console.log(`   Símbolo: ${nft.symbol}`);
      console.log(`   URI: ${nft.uri}`);
      console.log(`   Update Authority: ${nft.updateAuthorityAddress.toString()}`);
      
      // Verificar se a wallet atual é a update authority
      if (!nft.updateAuthorityAddress.equals(keypair.publicKey)) {
        throw new Error(`Você não é a update authority deste NFT. Authority: ${nft.updateAuthorityAddress.toString()}`);
      }
      
      console.log('\n📋 Atualizações:');
      if (options.name) console.log(`   Nome: ${options.name}`);
      if (options.symbol) console.log(`   Símbolo: ${options.symbol}`);
      if (options.uri) console.log(`   URI: ${options.uri}`);
      
      if (options.dryRun) {
        console.log('\n🔍 [DRY RUN] Transação não executada');
        console.log(`📄 NFT seria atualizado com Metaplex SDK`);
        return;
      }
      
      // Atualizar NFT
      await updateNFT(
        metaplex,
        mintAddress,
        keypair,
        options.uri,
        options.name,
        options.symbol
      );
      
      console.log('\n✅ NFT atualizado com sucesso!');
      console.log(`🎯 Mint: ${mintAddress.toString()}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=${networkConfig.name}`);
      
      // Buscar NFT atualizado
      const updatedNFT = await getNFT(metaplex, mintAddress);
      
      const updateInfo = {
        mint: mintAddress.toString(),
        newName: updatedNFT.name,
        newSymbol: updatedNFT.symbol,
        newUri: updatedNFT.uri,
        updatedAt: new Date().toISOString(),
        network: networkConfig.name
      };
      
      console.log('\n📋 NFT Atualizado:');
      console.log(JSON.stringify(updateInfo, null, 2));
      
      console.log('\n🎉 NFT atualizado com sucesso!');
      console.log('💡 Próximos passos:');
      console.log('   1. Verifique as mudanças no Solana Explorer');
      console.log('   2. Confirme a nova metadata em sua wallet');
      console.log('   3. Atualize marketplaces se aplicável');
      
    } catch (error) {
      console.error('❌ Erro ao atualizar NFT:', error);
      process.exit(1);
    }
  });

program.parse();
