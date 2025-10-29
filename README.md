# DeSci Reviews: The Capital Markets for Knowledge

**DeSci Reviews is a market-oriented scientific publishing platform that transforms how research is funded, evaluated, and monetized.** We move away from the traditional publication model to create a dynamic ecosystem where knowledge becomes a capital asset, with on-chain liquidity and credibility.

## 🚨 **The Problem: Traditional Scientific Publishing**

The current scientific publishing system is broken. Authors pay exorbitant fees to publish, reviewers (the backbone of scientific validation) are not compensated, and knowledge remains trapped behind institutional paywalls. The result is a system that expropriates creators' copyright and limits access and liquidity of ideas.

- **Authors Pay:** Costs of $2k to $15k per article
- **Reviewers Unpaid:** Volunteer work is not recognized or rewarded
- **Trapped Knowledge:** Static PDF files, no visibility or liquidity
- **Expropriated Rights:** Publishers hold copyright, not authors

## ✨ **The Solution: An Ideas Economy on Solana**

DeSci Reviews reimagines publishing as a listing event in an ideas marketplace. Built on the Solana blockchain, our protocol provides infrastructure to transform intellectual assets into programmable and tradeable assets.

- **Each Journal is a Portfolio:** Curated collections of knowledge assets with market potential
- **Each Article is a Listing Event:** Publishing an article, protocol, or project is like an "IPO of ideas," giving it visibility and a place in the market
- **Each Review is Market Analysis:** Peer reviews become "analyst coverage," providing on-chain credibility and helping the market price the intellectual asset

## 🏗️ **How It Works: On-Chain Architecture**

Our infrastructure uses Solana primitives to create a transparent, efficient, and composable system.

### **Research Assets (pNFTs)**
Each article, protocol, or dataset is minted as a pNFT (programmable Non-Fungible Token) using the Metaplex Core standard. This ensures provenance, enables automatic royalty payments to creators, and provides liquidity to the intellectual asset. Metadata is stored permanently on Arweave, ensuring immutability.

### **Reviewer Badges (SBTs)**
To build a robust reputation system, we issue Reviewer Badges as Soul-Bound Tokens (SBTs), using the NonTransferable extension of the SPL Token-2022 standard. These badges function as on-chain identity, attesting to each reviewer's specialty and contribution history.

### **Rewards Treasury**
A decentralized treasury, implemented as a PDA (Program Derived Address), manages rewards for reviewers. The treasury is funded with Liquid Staking Tokens (LSTs) like mSOL and jitoSOL, allowing treasury capital to grow sustainably while rewarding network contributions.

## 🚀 **Implemented Features**

### **Core Features**
- **PDF Upload** - Upload research papers to Arweave via Irys (devnet tested)
- **pNFT Minting** - Transform papers into programmable NFTs on Solana (client-side signing)
- **Permanent Storage** - PDFs and metadata stored on Arweave with immutability
- **Modern Interface** - React/Next.js frontend with Tailwind CSS
- **Wallet Integration** - Phantom and Solflare support (tested on devnet)
- **Accessibility** - WCAG AA compliance

### **Blockchain Infrastructure**
- **Metaplex** - NFT standard for research assets (using @metaplex-foundation/js)
- **Arweave Storage** - Permanent storage via Irys (devnet: https://devnet.irys.xyz)
- **Solana Program Library** - Integration with Solana primitives
- **Program Derived Addresses** - PDAs for treasuries and governance
- **Client-Side Signing** - Users sign all transactions with their wallet

### **Working Flow**
1. User connects wallet (Phantom/Solflare) on devnet
2. User uploads PDF + images via form
3. Backend uploads files to Arweave via Irys (server-side)
4. Backend uploads metadata to Arweave via Irys (server-side)
5. Frontend mints NFT with Metaplex (client-side, user signs)
6. NFT is created with permanent Arweave references
7. User owns the NFT, can verify on Solana Explorer

## 🛠️ **Technologies**

### **Frontend**
- **Next.js 15** - React framework with SSR
- **TypeScript** - Static typing
- **Tailwind CSS** - Modern styling
- **Shadcn/ui** - Accessible UI components
- **Solana Wallet Adapter** - Wallet integration

### **Blockchain**
- **Solana** - Main blockchain
- **Metaplex Core** - Programmable NFT standard
- **Arweave** - Permanent storage
- **Irys** - Arweave upload
- **SPL Token-2022** - Tokens with extensions

## 🚀 **Get Started (Developer Guide)**

Ready to build the future of science? Set up your local environment and start interacting with the DeSci Reviews protocol.

### **1. Install Dependencies**

```bash
# Frontend
cd frontend
npm install

# Root
cd ..
npm install

# Install Irys CLI (for funding uploads)
npm install -g @irys/sdk
```

### **2. Configure Environment**

#### **Generate Keypair**

```bash
# Generate a new keypair
npx tsx scripts/utils/generate-keypair.ts

# This creates keypair.json
# For devnet testing, use this keypair
```

#### **Convert to Base58 (for Irys)**

```bash
# Convert keypair to base58 format
npx tsx scripts/utils/keypair-to-base58.ts

# Copy the output - you'll need it for IRYS_PRIVATE_KEY
```

#### **Create Environment File**

Create `frontend/.env.local`:

```bash
# Devnet Configuration (Testing)
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_COLLECTION_ADDRESS=HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6

# Irys Configuration (paste base58 from step above)
IRYS_PRIVATE_KEY=your_base58_private_key_here
NETWORK=devnet
```

### **3. Fund Irys Account**

```bash
# Get devnet SOL from faucet
# Visit: https://faucet.solana.com/
# Request 1-2 SOL for your wallet address

# Fund Irys devnet with 0.1 SOL (enough for ~100 uploads)
irys fund 100000000 -w keypair.json -n devnet -t solana --provider-url https://api.devnet.solana.com

# Verify Irys balance
irys balance YOUR_WALLET_ADDRESS -n devnet -t solana --provider-url https://api.devnet.solana.com
```

### **4. Start Development Server**

```bash
cd frontend
npm run dev
```

Access: http://localhost:3000

### **5. Mint Your First NFT**

1. **Connect Wallet:**
   - Install Phantom or Solflare browser extension
   - Configure wallet for **Devnet**
   - Get SOL from faucet: https://faucet.solana.com/
   - Connect at http://localhost:3000

2. **Submit Research Paper:**
   - Go to http://localhost:3000/research/submit
   - Upload PDF (max 50MB)
   - Upload cover/NFT images (optional)
   - Fill metadata (title, authors, description)
   - Click "Submit" or "Mint as NFT"

3. **Approve Transaction:**
   - Wallet popup will open
   - Review transaction details
   - Click "Approve"
   - Wait for confirmation (~5-10 seconds)

4. **Verify NFT:**
   - Copy the mint address from success message
   - View on Solana Explorer
   - Your NFT is now on-chain with metadata on Arweave!

### **6. Main Commands**

Our scripts allow interaction with all facets of the protocol. Use `--dry-run` to simulate any transaction without cost.

#### **Collections and Research Assets**

```bash
# Create a new collection to group assets
npx tsx scripts/assets/create-collection-metaplex.ts --name "My Research Collection"

# Mint a new research asset as a pNFT
npx tsx scripts/assets/mint-research-asset-metaplex.ts \
  --title "Generative AI Protocol" \
  --authors "Author One,Author Two" \
  --hash "<sha256_of_file>" \
  --uri "<arweave_uri>" \
  --collection <COLLECTION_ADDRESS>

# Auto upload to Arweave and mint
npx tsx scripts/assets/mint-auto-upload.ts \
  --file "paper.pdf" \
  --title "Paper Title" \
  --authors "Author1,Author2"
```

#### **Reviewer Badges and Reputation**

```bash
# Create the token that will serve as the base for reviewer badges
npx tsx scripts/badges/create-badge-mint.ts --name "AI Reviewer Badge"

# Issue a badge to a specific reviewer
npx tsx scripts/badges/issue-badge.ts \
  --reviewer <REVIEWER_PUBKEY> \
  --mint <BADGE_MINT_ADDRESS> \
  --level 3
```

#### **Rewards Treasury**

```bash
# Initialize the rewards treasury for your community
npx tsx scripts/treasury/init-vault.ts --initial-sol 1.0

# Deposit LSTs to fund reward payments
npx tsx scripts/treasury/deposit-lst.ts --amount 100 --mint <LST_MINT>

# Pay a reviewer for their work
npx tsx scripts/treasury/pay-reviewer.ts \
  --reviewer <REVIEWER_PUBKEY> \
  --amount 10 \
  --mint <LST_MINT>
```

## 📱 **Web Interface**

### **1. Connect Wallet**

1. Install wallet extension (Phantom or Solflare)
2. Configure for **Devnet** (Settings > Network > Devnet)
3. Get SOL from faucet: https://faucet.solana.com/
4. Connect in the application

### **2. Mint Paper as NFT**

1. Access `/research/submit`
2. Upload PDF (max 50MB)
3. Upload cover image (optional, recommended)
4. Upload NFT image (optional)
5. Fill metadata (title, authors, description)
6. Click "Submit" or "Mint as NFT"
7. **Approve transaction in your wallet**
8. Wait for confirmation (~5-10 seconds)
9. Copy mint address and view on Explorer!

### **3. Debug and Troubleshooting**

1. Access `/debug`
2. Use "Direct Wallet Connect" for connection issues
3. Check connection status and RPC health
4. Test wallet detection
5. View detailed logs

## 📊 **APIs**

### **File Upload (Server-Side)**
```typescript
POST /api/upload
Content-Type: multipart/form-data

FormData: {
  pdf: File,
  coverImage?: File,
  nftImage?: File
}

// Returns:
{
  "pdfUri": "https://gateway.irys.xyz/[ID]",
  "pdfHash": "sha256:[hash]",
  "coverImageUri": "https://gateway.irys.xyz/[ID]",
  "nftImageUri": "https://gateway.irys.xyz/[ID]",
  "uploaded": true,
  "message": "Files uploaded successfully to Arweave"
}
```

### **Metadata Upload (Server-Side)**
```typescript
POST /api/upload-metadata
Content-Type: application/json

{
  "metadata": {
    "name": "Paper Title",
    "description": "Paper description",
    "image": "https://gateway.irys.xyz/[ID]",
    "attributes": [...],
    "properties": {...}
  }
}

// Returns:
{
  "success": true,
  "uri": "https://gateway.irys.xyz/[ID]",
  "id": "[transaction_id]"
}
```

### **NFT Mint (Client-Side)**
Mint is performed client-side using the `useMintNFT` hook:

```typescript
import { useMintNFT } from '@/hooks/useMintNFT';

const { mintNFT, loading, error } = useMintNFT();

const result = await mintNFT({
  name: "Paper Title",
  description: "Paper description",
  image: "https://gateway.irys.xyz/[ID]",
  externalUrl: "https://gateway.irys.xyz/[PDF_ID]",
  attributes: [...],
  files: [...],
  collectionAddress: "[collection_address]"
});

// User signs transaction in wallet
// Returns: { success: true, mintAddress: "[NFT_address]", signature: "[tx_sig]" }
```

## 🔧 **Configuration**

### **Environment Variables**

#### **Frontend (frontend/.env.local)**
   ```bash
# Network Configuration
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_COLLECTION_ADDRESS=HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6

# Backend Configuration (for API routes)
IRYS_PRIVATE_KEY=your_base58_private_key
NETWORK=devnet
```

**How to get IRYS_PRIVATE_KEY:**
   ```bash
# Convert your keypair to base58
npx tsx scripts/utils/keypair-to-base58.ts

# Copy the output and paste in .env.local
```

### **Supported Wallets**

- **Solflare** - https://solflare.com/
- **Phantom** - https://phantom.app/

**Important:** Configure wallet for **Devnet** before connecting!

## 🏗️ **Available Scripts**

### **Development**

```bash
# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server

# Tests
node scripts/test-wallet.js    # Test configuration
```

### **Blockchain**

```bash
# NFT Mint
npm run mint:metaplex

# Arweave Upload
npm run upload:irys

# Create Collection
npm run create:collection
```

## 🔍 **Debug and Troubleshooting**

### **Debug Page**
- **URL:** `http://localhost:3000/debug`
- **Features:**
  - Wallet connection test
  - API verification
  - Detailed logs
  - Wallet detection

### **Common Issues**

1. **Wallet won't connect**
   - Check if extension is installed
   - Check if on Devnet
   - Reload page

2. **Upload fails**
   - Check file size
   - Check internet connection
   - Check console logs

3. **Mint fails**
   - Check if wallet is connected
   - Check if has enough SOL
   - Check if collection address is correct

## 🤝 **Contributions**

This is an open-source project and we invite the community to contribute. Feel free to open a Pull Request or contact us with ideas.

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 🚀 **Production Deployment**

### Quick Start for Mainnet

DeSci Reviews can be deployed to production on Solana mainnet-beta using Vercel.

**Prerequisites:**
- Mainnet keypair with ~1.5 SOL
- Helius RPC account (free tier)
- Irys account funded for uploads
- Vercel account (free tier)

**Cost Estimate:**
- Setup: ~1.5 SOL (~$150 one-time)
- Hosting: $0/month (free tier)
- Per paper: ~$0.15 (uploads + fees)

### Deployment Steps

1. **Setup Infrastructure** (30 min)
   - Create Helius account → Get API key
   - Generate/fund mainnet keypair
   - Convert keypair to base58
   - Fund Irys account

2. **Create Collection** (5 min)
```bash
   NETWORK=mainnet-beta npx tsx scripts/assets/create-collection-metaplex.ts \
     --name "DeSci Reviews Research Collection"
   ```

3. **Configure Environment** (10 min)
   - Set environment variables locally
   - Configure Vercel environment variables
   - Verify .gitignore protects secrets

4. **Deploy to Vercel** (5 min)
   - Connect GitHub repository
   - Configure build settings
   - Deploy to production

5. **Test in Production** (15 min)
   - Connect wallet on mainnet
   - Test file upload
   - Verify Arweave storage
   - Monitor costs

### Detailed Guides

- **📘 [DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with commands
- **🔒 [SECURITY.md](./SECURITY.md)** - Security best practices and key management
- **📝 [env.example](./env.example)** - Environment variable templates

### Production Considerations

**Security:**
- Never commit private keys
- Use Vercel Secrets for sensitive variables
- Monitor keypair balance regularly
- Implement rate limiting (included)

**Costs:**
- Helius RPC: Free (100k req/day)
- Vercel Hosting: Free (Hobby plan)
- Irys uploads: ~$0.001-0.01 per MB
- Solana transactions: ~$0.0005 each

**Monitoring:**
- Keypair balance (alert if < 0.1 SOL)
- Irys balance (alert if < 0.1 SOL)
- Helius usage (90% of limit)
- Vercel function logs

### Production URLs

- **Mainnet Explorer:** https://explorer.solana.com/?cluster=mainnet-beta
- **Helius Dashboard:** https://dashboard.helius.dev
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Irys Gateway:** https://gateway.irys.xyz

## 📄 **License**

Distributed under the MIT License. See the LICENSE file for more details.

## 🆘 **Support**

For issues or questions:

1. **Development:** Check debug page at `/debug`
2. **Deployment:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Security:** See [SECURITY.md](./SECURITY.md)
4. **Bugs:** Open an issue on GitHub

---

**Developed with ❤️ for the scientific community on Solana**
