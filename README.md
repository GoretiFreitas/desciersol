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

### **✅ Core Features**
- **PDF Upload** - Upload research papers to Arweave via Irys
- **pNFT Minting** - Transform papers into programmable NFTs on Solana
- **Permanent Storage** - Data stored on Arweave with immutability
- **Modern Interface** - React/Next.js frontend with Tailwind CSS
- **Wallet Integration** - Phantom and Solflare support
- **Accessibility** - WCAG AA compliance

### **✅ Blockchain Infrastructure**
- **Metaplex Core** - NFT standard for research assets
- **Arweave Storage** - Permanent storage via Irys
- **Solana Program Library** - Integration with Solana primitives
- **Program Derived Addresses** - PDAs for treasuries and governance

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
```

### **2. Configure Environment**

Copy the example file and edit `.env.local` with your RPC, keypair, and other Solana network parameters.

```bash
cp env.example .env.local
```

If you don't have a keypair yet, generate one with:

```bash
npx tsx scripts/utils/generate-keypair.ts
```

### **3. Main Commands**

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
2. Configure for Devnet
3. Get SOL from faucet: https://faucet.solana.com/
4. Connect in the application

### **2. Mint Paper as NFT**

1. Access `/research/submit`
2. Upload PDF (max 50MB)
3. Upload cover image (optional)
4. Upload NFT image (optional)
5. Fill metadata
6. Click "Mint as NFT"

### **3. Debug and Troubleshooting**

1. Access `/debug`
2. Use "Simple Wallet Test"
3. Check connection status
4. Test APIs

## 📊 **APIs**

### **File Upload**
```typescript
POST /api/upload
Content-Type: multipart/form-data

// Returns: { pdfUri, pdfHash, coverImageUri, nftImageUri }
```

### **NFT Mint**
```typescript
POST /api/mint
Content-Type: application/json

{
  "title": "Paper Title",
  "authors": "Author Name",
  "pdfUri": "ar://...",
  "pdfHash": "sha256...",
  "coverImageUri": "ar://...",
  "nftImageUri": "ar://..."
}
```

## 🔧 **Configuration**

### **Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_COLLECTION_ADDRESS=HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

### **Supported Wallets**

- **Phantom** - https://phantom.app/
- **Solflare** - https://solflare.com/

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

## 📄 **License**

Distributed under the MIT License. See the LICENSE file for more details.

## 🆘 **Support**

For issues or questions:

1. Check debug page: `/debug`
2. Check console logs
3. Check variable configuration
4. Open an issue on GitHub

---

**Developed with ❤️ for the scientific community on Solana**
