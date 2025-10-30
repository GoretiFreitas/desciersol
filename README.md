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
Each article, protocol, or dataset is minted as a pNFT (programmable Non-Fungible Token) using the Metaplex Core standard. This ensures provenance, enables automatic royalty payments to creators, and provides liquidity to the intellectual asset. Metadata is stored permanently on Arweave via Irys, ensuring immutability.

### **Reviewer Badges (SBTs)**
To build a robust reputation system, we issue Reviewer Badges as Soul-Bound Tokens (SBTs), using the NonTransferable extension of the SPL Token-2022 standard. These badges function as on-chain identity, attesting to each reviewer's specialty and contribution history.

### **Rewards Treasury**
A decentralized treasury manages rewards for reviewers through SOL staking. Reviewers stake SOL to become eligible for rewards, and the treasury automatically distributes payments based on review quality and contributions.

## 🚀 **Implemented Features**

### **Core Features**
- **PDF Upload** - Upload research papers to Arweave via Irys
- **NFT Minting** - Transform papers into programmable NFTs on Solana mainnet
- **Permanent Storage** - PDFs and metadata stored on Arweave with immutability
- **Review System** - On-chain peer review with metadata updates
- **Badge System** - Soul-Bound Tokens for reviewer reputation
- **Treasury** - SOL staking and reward distribution
- **Modern Interface** - React/Next.js frontend with Tailwind CSS
- **Wallet Integration** - Phantom and Solflare support
- **Accessibility** - WCAG AA compliance

### **Blockchain Infrastructure**
- **Metaplex Core** - NFT standard for research assets
- **Arweave Storage** - Permanent storage via Irys
- **Solana Program Library** - Integration with Solana primitives
- **Program Derived Addresses** - PDAs for treasuries
- **Backend Minting** - Server-side NFT creation with user transfers

### **Working Flow**
1. User connects wallet (Phantom/Solflare) on mainnet
2. User uploads PDF + images via form
3. Backend uploads files to Arweave via Irys
4. Backend uploads metadata to Arweave via Irys
5. Backend mints NFT with Metaplex
6. NFT is transferred to user's wallet
7. User owns the NFT with permanent Arweave references
8. Reviewers can submit reviews and earn badges
9. Treasury manages staking and rewards

## 🛠️ **Technologies**

### **Frontend**
- **Next.js 15** - React framework with SSR
- **TypeScript** - Static typing
- **Tailwind CSS** - Modern styling
- **Shadcn/ui** - Accessible UI components
- **Solana Wallet Adapter** - Wallet integration

### **Blockchain**
- **Solana Mainnet** - Production blockchain
- **Metaplex Core** - Programmable NFT standard
- **Arweave** - Permanent storage
- **Irys** - Arweave upload service
- **SPL Token-2022** - Tokens with extensions
- **Helius RPC** - Reliable mainnet access

## 🚀 **Get Started**

### **Prerequisites**
- Node.js 18+ and npm
- Solana wallet (Phantom or Solflare)
- Mainnet SOL for transactions

### **1. Clone and Install**
```bash
git clone https://github.com/yourusername/descier.git
cd descier

# Install frontend dependencies
cd frontend
npm install

# Return to root
cd ..
npm install
```

### **2. Configure Environment**

Create `frontend/.env.local`:

```env
# Network Configuration - MAINNET
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
NETWORK=mainnet-beta

# Backend Keypair (NEVER commit this!)
IRYS_PRIVATE_KEY=your_base58_private_key_here

# Collection Addresses - MAINNET
NEXT_PUBLIC_COLLECTION_ADDRESS=7K2jbK53iw4oNftvbyNBMQVA6tQJUrQAWz1nJKdeWRTC
NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS=FWdnCLxzU3hFhXuqBwevLUBe1fyPpJaGn1uXme9C5MZi

# Vault Address
NEXT_PUBLIC_VAULT_ADDRESS=Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6
```

### **3. Start Development Server**
```bash
cd frontend
npm run dev
```

Access: http://localhost:3000

## 📱 **Web Interface**

### **Features**

#### **Browse Research Papers**
- View all published NFTs in the collection
- Search by title, authors, or tags
- Filter by version, license, or field
- View on-chain metadata

#### **Submit Research Paper**
1. Connect your wallet
2. Upload PDF (max 50MB)
3. Upload cover and NFT images
4. Fill metadata
5. Click "Submit"
6. Approve transaction

#### **Review Research Papers**
1. Browse available papers
2. Select a paper to review
3. Submit detailed review
4. Earn badges as you progress
5. Reviews update NFT metadata on-chain

#### **Reviewer Dashboard**
- View your badges
- Track review count
- Monitor reputation level
- See staking status

#### **Treasury**
- Stake SOL to become a reviewer
- Claim rewards for reviews
- Monitor treasury balance
- Track citations and royalties

## 🚀 **Deploy to Production**

### **Vercel Deployment**

1. **Create vercel.json** in root:
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm run build",
  "framework": "nextjs",
  "outputDirectory": "frontend/.next",
  "functions": {
    "frontend/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

2. **Configure Environment Variables in Vercel:**
   - Add all variables from `frontend/.env.local`
   - Mark `IRYS_PRIVATE_KEY` as secret

3. **Deploy:**
```bash
# Via CLI
vercel --prod

# Or via GitHub integration
# Push to main branch, Vercel auto-deploys
```

## 📊 **Production Status**

### **Current Deployments**

- **Network:** Solana Mainnet Beta
- **Collection:** 7K2jbK53iw4oNftvbyNBMQVA6tQJUrQAWz1nJKdeWRTC
- **Badge Collection:** FWdnCLxzU3hFhXuqBwevLUBe1fyPpJaGn1uXme9C5MZi
- **Treasury:** Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6

### **Infrastructure**
- **Storage:** Arweave via Irys
- **RPC:** Helius
- **Hosting:** Vercel (recommended)

## 🔧 **Configuration**

### **Environment Variables**

See `env.example` for detailed configuration options.

**Required:**
- `NEXT_PUBLIC_NETWORK` - Network (mainnet-beta or devnet)
- `NEXT_PUBLIC_RPC_URL` - RPC endpoint
- `IRYS_PRIVATE_KEY` - Backend keypair (base58)
- `NEXT_PUBLIC_COLLECTION_ADDRESS` - NFT collection
- `NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS` - Badge collection
- `NEXT_PUBLIC_VAULT_ADDRESS` - Treasury vault

### **Supported Wallets**
- **Phantom** - https://phantom.app/
- **Solflare** - https://solflare.com/

**Important:** Configure wallet for **Mainnet** before connecting!

## 🏗️ **Available Scripts**

### **Frontend**
```bash
cd frontend

npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Linting
```

### **Blockchain Operations**
```bash
# Collections
npx tsx scripts/assets/create-collection-metaplex.ts

# Badges
npx tsx scripts/badges/create-badge-mint.ts

# Treasury
npx tsx scripts/treasury/init-vault.ts
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Wallet won't connect**
   - Check if extension is installed
   - Verify network is mainnet
   - Reload page

2. **Upload fails**
   - Check file size (max 50MB)
   - Verify Irys balance
   - Check console logs

3. **Mint fails**
   - Ensure wallet has SOL for fees
   - Verify collection address
   - Check network connection

4. **NFT not appearing**
   - Wait for indexing (may take 30-60s)
   - Refresh page
   - Check Solana Explorer

### **Support**

- **GitHub Issues:** https://github.com/yourusername/descier/issues
- **Documentation:** Check README files
- **Security:** See [SECURITY.md](./SECURITY.md)

## 🤝 **Contributions**

This is an open-source project. We welcome contributions!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 **License**

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.

## 🆘 **Security**

For security concerns:
- Review [SECURITY.md](./SECURITY.md)
- Report vulnerabilities responsibly
- Never commit private keys

---

**Built with ❤️ for the scientific community on Solana**
