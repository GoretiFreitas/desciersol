# DeSci Reviews - Production Deployment Checklist

## ✅ Completed (Code Ready)

- [x] Rate limiting implemented (5 uploads/hour)
- [x] Security headers configured
- [x] .gitignore protecting sensitive files
- [x] Environment variable templates created
- [x] DEPLOYMENT.md guide created
- [x] SECURITY.md policy created
- [x] README updated with production section
- [x] Code pushed to GitHub

## 📋 Next Steps (Manual Actions Required)

### 1. Infrastructure Setup (30 minutes)

#### A. Helius RPC Account
- [ ] Go to https://helius.dev
- [ ] Sign up for free account
- [ ] Create new project
- [ ] Copy API key
- [ ] Save as: `HELIUS_API_KEY`

**RPC Endpoint:** `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

#### B. Prepare Mainnet Keypair

You already have:
- **Address:** `H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S`
- **Private Key Array:** `[171,167,255,88...]`

Actions needed:
- [ ] Create file `keypair-mainnet.json` with the array (locally only, never commit)
- [ ] Verify current balance: `solana balance H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S --url mainnet-beta`
- [ ] Fund if needed (target: ~1.5 SOL total)

#### C. Convert Keypair to Base58

```bash
cd /Users/marceloteix/Documents/Descier
npx tsx scripts/utils/keypair-to-base58.ts
```

- [ ] Run conversion script
- [ ] Save output securely (this is `IRYS_PRIVATE_KEY`)
- [ ] Store in password manager

#### D. Fund Irys Account

```bash
# Install Irys CLI if needed
npm install -g @irys/sdk

# Fund with 0.5 SOL
irys fund 500000000 -w keypair-mainnet.json -n mainnet -t solana

# Verify balance
irys balance -w keypair-mainnet.json -n mainnet -t solana
```

- [ ] Irys CLI installed
- [ ] Account funded with 0.5 SOL
- [ ] Balance verified

### 2. Create Mainnet Collection (5 minutes)

```bash
# Set environment
export NETWORK=mainnet-beta
export RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
export KEYPAIR_PATH=./keypair-mainnet.json

# Create collection
npx tsx scripts/assets/create-collection-metaplex.ts \
  --name "DeSci Reviews Research Collection" \
  --symbol "DSCI" \
  --description "Decentralized scientific research papers as programmable NFTs on Solana"
```

- [ ] Collection created
- [ ] Collection address saved: `_______________________`
- [ ] Transaction verified on explorer

**Save this address!** You'll need it for environment variables.

### 3. Configure Environment Variables (10 minutes)

#### A. Local Backend (.env in root)

Create `/Users/marceloteix/Documents/Descier/.env`:

```bash
# Solana Mainnet
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NETWORK=mainnet-beta

# Wallet (NEVER COMMIT!)
KEYPAIR_PATH=./keypair-mainnet.json
IRYS_PRIVATE_KEY=YOUR_BASE58_PRIVATE_KEY

# Metaplex
CORE_PROGRAM_ID=CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
TOKEN_2022_PROGRAM_ID=TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# LST Mints (Mainnet)
MSOL_MINT=mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So
JITOSOL_MINT=J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn

# Treasury
TREASURY_SEED=desci_reviews_treasury
DEFAULT_ROYALTY_BASIS_POINTS=500
```

- [ ] .env file created
- [ ] All values filled in
- [ ] File is git-ignored (verify with `git status`)

#### B. Local Frontend (.env.local)

Create `/Users/marceloteix/Documents/Descier/frontend/.env.local`:

```bash
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_COLLECTION_ADDRESS=YOUR_COLLECTION_ADDRESS
```

- [ ] .env.local file created
- [ ] Collection address filled in
- [ ] File is git-ignored

### 4. Test Locally (10 minutes)

```bash
cd frontend
npm install
npm run build
npm run dev
```

- [ ] Build succeeds without errors
- [ ] Dev server starts
- [ ] Can access http://localhost:3000
- [ ] Wallet connects to mainnet
- [ ] No console errors

### 5. Deploy to Vercel (5 minutes)

#### A. Connect Repository
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New Project"
- [ ] Import `GoretiFreitas/desciersol` (note: repo moved)
- [ ] Root Directory: `frontend`
- [ ] Framework: Next.js (auto-detected)

#### B. Configure Environment Variables

In Vercel (Settings > Environment Variables):

| Variable | Value | Secret? |
|----------|-------|---------|
| `NEXT_PUBLIC_NETWORK` | `mainnet-beta` | No |
| `NEXT_PUBLIC_RPC_URL` | `https://mainnet.helius-rpc.com/?api-key=XXX` | No |
| `NEXT_PUBLIC_COLLECTION_ADDRESS` | Your collection address | No |
| `IRYS_PRIVATE_KEY` | Your base58 private key | **YES** ✓ |
| `NETWORK` | `mainnet-beta` | No |

- [ ] All variables configured
- [ ] IRYS_PRIVATE_KEY marked as Secret
- [ ] Double-checked all values

#### C. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (~2-3 min)
- [ ] Build succeeds
- [ ] Deployment URL received

**Deployment URL:** `https://________________.vercel.app`

### 6. Test Production (15 minutes)

#### A. Basic Functionality
- [ ] Access deployment URL
- [ ] Page loads correctly
- [ ] No console errors
- [ ] Images display
- [ ] Navigation works

#### B. Wallet Connection
- [ ] Connect Phantom/Solflare
- [ ] Verify wallet shows mainnet network
- [ ] Wallet address displays
- [ ] Can disconnect/reconnect

#### C. File Upload Test
- [ ] Navigate to `/research/submit`
- [ ] Upload small test PDF (1-5 MB)
- [ ] Upload completes successfully
- [ ] Arweave URI returned
- [ ] Verify PDF accessible at URI

#### D. Verify Costs
```bash
# Check balance after upload
solana balance H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S --url mainnet-beta

# Check Irys balance
irys balance -w keypair-mainnet.json -n mainnet -t solana
```

- [ ] Keypair balance decreased as expected
- [ ] Irys balance decreased as expected
- [ ] Costs match estimates (~$0.15 for test)

### 7. Monitoring Setup (10 minutes)

#### A. Set Calendar Reminders
- [ ] Daily: Check keypair balance
- [ ] Daily: Check Helius usage
- [ ] Weekly: Check Irys balance
- [ ] Weekly: Review Vercel logs

#### B. Create Alert Thresholds
- [ ] Keypair < 0.1 SOL → Fund immediately
- [ ] Irys < 0.1 SOL → Fund immediately
- [ ] Helius > 90k req/day → Consider upgrade
- [ ] Error rate spike → Investigate

#### C. Bookmark Dashboards
- [ ] Helius: https://dashboard.helius.dev
- [ ] Vercel: https://vercel.com/dashboard
- [ ] Solana Explorer: https://explorer.solana.com/?cluster=mainnet-beta

### 8. Documentation & Backups (5 minutes)

#### A. Secure Backups
- [ ] Keypair backed up in 3 locations
- [ ] Collection address documented
- [ ] Environment variables backed up (encrypted)
- [ ] Helius API key saved securely

#### B. Emergency Contacts
- [ ] Team members have access info
- [ ] Recovery procedures documented
- [ ] Support contacts saved

### 9. Go Live (5 minutes)

- [ ] Announce to team
- [ ] Share production URL
- [ ] Monitor for first 24 hours
- [ ] Be ready for user feedback

## 📊 Cost Tracking

### Initial Costs (One-Time)
| Item | Amount | Cost |
|------|--------|------|
| Keypair funding | 0.5 SOL | ~$50 |
| Irys funding | 0.5 SOL | ~$50 |
| Collection creation | 0.01 SOL | ~$1 |
| Buffer | 0.5 SOL | ~$50 |
| **Total** | **1.51 SOL** | **~$151** |

### Ongoing Costs (Estimated)
| Item | Per Unit | Monthly (100 papers) |
|------|----------|---------------------|
| Helius RPC | Free | $0 |
| Vercel Hosting | Free | $0 |
| PDF uploads | ~$0.10 | ~$10 |
| Image uploads | ~$0.05 | ~$5 |
| Transaction fees | ~$0.0005 | ~$0.05 |
| **Total** | - | **~$15/month** |

## 🔒 Security Reminders

- **Never commit:** .env, .env.local, keypair files
- **Always check:** git status before pushing
- **Mark as secret:** IRYS_PRIVATE_KEY in Vercel
- **Backup regularly:** Keypairs in 3+ locations
- **Monitor balances:** Daily checks recommended
- **Rotate keys:** If any sign of compromise

## 📞 Support Resources

- **Deployment Issues:** See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Security Questions:** See [SECURITY.md](./SECURITY.md)
- **Technical Support:** Open GitHub issue
- **Emergency:** Contact team immediately

## ✅ Final Checklist

Before marking production ready:

- [ ] All infrastructure setup complete
- [ ] Collection created on mainnet
- [ ] Environment variables configured
- [ ] Vercel deployment successful
- [ ] Production tests passing
- [ ] Monitoring configured
- [ ] Backups completed
- [ ] Team notified

**Once all checked: You're live on mainnet! 🚀**

---

**Repository:** https://github.com/GoretiFreitas/desciersol  
**Wallet:** H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S  
**Network:** mainnet-beta  
**Created:** October 28, 2024
