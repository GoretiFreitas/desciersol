import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import bs58 from 'bs58';

/**
 * API Route: Create NFT via Backend
 * This solves the "Transfer from must not carry data" issue by using
 * the backend keypair instead of the user's wallet for minting
 */

async function loadBackendKeypair(): Promise<Keypair> {
  const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY;
  
  if (!privateKeyBase58) {
    throw new Error('IRYS_PRIVATE_KEY not configured');
  }
  
  // Decode base58 private key
  const secretKey = bs58.decode(privateKeyBase58);
  return Keypair.fromSecretKey(secretKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      metadataUri,
      name,
      description,
      image,
      attributes = [],
      wallet, // User's wallet address to receive the NFT
      collectionAddress, // Optional collection
    } = body;

    if (!metadataUri || !name || !wallet) {
      return NextResponse.json(
        { error: 'Missing required fields: metadataUri, name, wallet' },
        { status: 400 }
      );
    }

    console.log('🎨 Starting backend NFT creation...');
    console.log('   Name:', name);
    console.log('   Metadata URI:', metadataUri);
    console.log('   To wallet:', wallet);

    // Load backend keypair
    const keypair = await loadBackendKeypair();
    console.log('   Backend wallet:', keypair.publicKey.toString());

    // Create connection
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });

    console.log('   RPC:', rpcUrl);

    // Create Metaplex instance with backend keypair
    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

    // Check balance
    const balance = await connection.getBalance(keypair.publicKey);
    const balanceSOL = balance / 1e9;
    console.log('   Balance:', balanceSOL.toFixed(4), 'SOL');

    // Prepare NFT params
    const nftParams: any = {
      uri: metadataUri,
      name: name,
      sellerFeeBasisPoints: 500, // 5% royalty
    };

    // Add collection if provided
    if (collectionAddress) {
      nftParams.collection = new PublicKey(collectionAddress);
      console.log('   Collection:', collectionAddress);
    }

    console.log('🎨 Creating NFT...');
    
    // Create NFT minted to backend wallet
    const createResult = await metaplex.nfts().create(nftParams, {
      commitment: 'confirmed',
    });
    
    const nft = createResult.nft;
    const mintAddress = nft.address.toString();

    console.log('✅ NFT created!');
    console.log('   Mint:', mintAddress);
    console.log('   Owner:', nft.owner.toString());

    // Verify collection if provided
    if (collectionAddress) {
      try {
        console.log('🔗 Verifying collection...');
        await metaplex.nfts().verifyCollection({
          mintAddress: nft.address,
          collectionMintAddress: new PublicKey(collectionAddress),
        });
        console.log('✅ Collection verified!');
      } catch (verifyError) {
        console.warn('⚠️ Collection verification failed:', verifyError);
      }
    }

    // Transfer NFT to user's wallet
    const userWallet = new PublicKey(wallet);
    console.log('🔄 Transferring NFT to user wallet...');
    
    let transferResult;
    try {
      transferResult = await metaplex.nfts().transfer({
        nftOrSft: nft,
        toOwner: userWallet,
      }, { commitment: 'confirmed' });
    } catch (transferError) {
      console.error('❌ Transfer failed:', transferError);
      throw transferError;
    }

    console.log('✅ NFT transferred!');
    const transferSignature = transferResult?.signature?.toString() || mintAddress;
    console.log('   Transfer signature:', transferSignature);
    console.log('   New owner:', userWallet.toString());

    const network = process.env.NEXT_PUBLIC_NETWORK || 'devnet';
    const explorerUrl = network === 'mainnet-beta' 
      ? `https://explorer.solana.com/address/${mintAddress}`
      : `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`;

    return NextResponse.json({
      success: true,
      mintAddress,
      signature: transferSignature,
      explorerUrl,
      owner: wallet,
    });

  } catch (error) {
    console.error('❌ Error creating NFT:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create NFT',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

