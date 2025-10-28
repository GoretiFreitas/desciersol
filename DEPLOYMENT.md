# DeSci Reviews - Deployment Guide

Complete guide for deploying DeSci Reviews to production on mainnet-beta.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Create Collection](#create-collection)
4. [Environment Configuration](#environment-configuration)
5. [Deploy to Vercel](#deploy-to-vercel)
6. [Post-Deployment Testing](#post-deployment-testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- [x] GitHub account with repository access
- [x] Vercel account (free tier sufficient)
- [x] Helius account for RPC access
- [x] Mainnet keypair with SOL balance
- [x] Irys account funded for uploads

### Required Tools

```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher
npm --version   # v9.0.0 or higher

# Git
git --version

# TypeScript executor
npm install -g tsx
```

### Required SOL Balance

- **Keypair:** ~1.5 SOL total
  - 0.5 SOL for rent and transactions
  - 0.5 SOL for Irys uploads
  - 0.5 SOL buffer

---

## Infrastructure Setup

### 1. Helius RPC Setup

1. Go to https://helius.dev
2. Sign up for free account (100k requests/day)
3. Create new project
4. Copy API key
5. RPC endpoint: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

**Cost:** Free tier sufficient for MVP

### 2. Mainnet Keypair Setup

**IMPORTANT: This keypair will hold real SOL. Store securely!**

#### Option A: Generate New Keypair (Recommended)

```bash
# From project root
npx tsx scripts/utils/generate-keypair.ts

# This creates keypair.json - rename for clarity
mv keypair.json keypair-mainnet.json
```

#### Option B: Use Existing Keypair

If you have an existing mainnet keypair (array format):

```bash
# Create keypair-mainnet.json with your private key array
cat > keypair-mainnet.json << EOF
[171,167,255,88,76,225,254,148,155,39,109,92,239,54,187,66,29,5,12,216,170,181,90,0,50,111,155,34,190,249,101,250,238,240,8,8,128,69,68,63,177,112,47,249,86,160,163,57,181,20,83,230,33,164,246,32,207,181,18,72,11,41,63,9]
EOF
```

**Public Address:** `H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S`

#### Fund the Keypair

```bash
# Check current balance
solana balance H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S --url mainnet-beta

# Transfer SOL from your main wallet
# Use Phantom, Solflare, or CLI to send ~1.5 SOL
```

### 3. Convert Keypair to Base58 (for Irys)

```bash
# Convert array format to base58
npx tsx scripts/utils/keypair-to-base58.ts

# Output will be base58 string - save this securely!
# Example output: 5Kd3N...base58...string
```

Save this base58 string - you'll need it for `IRYS_PRIVATE_KEY`.

### 4. Fund Irys Account

```bash
# Install Irys CLI
npm install -g @irys/sdk

# Fund with 0.5 SOL (adjust amount as needed)
irys fund 500000000 -w keypair-mainnet.json -n mainnet -t solana

# Check balance
irys balance -w keypair-mainnet.json -n mainnet -t solana
```

**Expected Output:** `Balance: 0.5 SOL`

---

## Create Collection

Create the NFT collection on mainnet that will group all research papers.

```bash
# Set environment for this command
export NETWORK=mainnet-beta
export RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
export KEYPAIR_PATH=./keypair-mainnet.json

# Create collection
npx tsx scripts/assets/create-collection-metaplex.ts \
  --name "DeSci Reviews Research Collection" \
  --symbol "DSCI" \
  --description "Decentralized scientific research papers as programmable NFTs on Solana"
```

**Expected Output:**
```
🎨 Criando coleção...
✅ Coleção criada com sucesso!
   Collection Address: AbCdEf123456789...
   Explorer: https://explorer.solana.com/address/AbCdEf123456789...?cluster=mainnet-beta
```

**SAVE THIS ADDRESS!** You'll need it for environment variables.

**Estimated Cost:** ~0.01 SOL (~$1)

---

## Environment Configuration

### 1. Backend Configuration

Create `.env` file in project root (this file is git-ignored):

```bash
# === PRODUCTION CONFIGURATION ===
# Solana Mainnet
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NETWORK=mainnet-beta

# Wallet (NEVER COMMIT THIS FILE!)
KEYPAIR_PATH=./keypair-mainnet.json
IRYS_PRIVATE_KEY=YOUR_BASE58_PRIVATE_KEY_FROM_STEP_3

# Metaplex Configuration
CORE_PROGRAM_ID=CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
TOKEN_2022_PROGRAM_ID=TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# LST Mints (Mainnet)
MSOL_MINT=mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So
JITOSOL_MINT=J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn

# Treasury Configuration
TREASURY_SEED=desci_reviews_treasury
DEFAULT_ROYALTY_BASIS_POINTS=500
```

### 2. Frontend Configuration

Create `frontend/.env.local` file (this file is git-ignored):

```bash
# Solana Mainnet
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_COLLECTION_ADDRESS=YOUR_COLLECTION_ADDRESS_FROM_STEP_ABOVE
```

### 3. Verify Configuration

```bash
# Test backend connection
cd frontend
npm run build

# Should build successfully with no errors
```

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
# Verify no sensitive files will be committed
git status

# Should NOT see:
# - .env
# - .env.local
# - keypair-mainnet.json

# Commit and push
git add .
git commit -m "feat: Production-ready deployment configuration"
git push origin main
```

### 2. Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from GitHub: `Carolcrt/descierctr`
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### 3. Configure Environment Variables

In Vercel project settings (Settings > Environment Variables), add:

| Name | Value | Environment | Type |
|------|-------|-------------|------|
| `NEXT_PUBLIC_NETWORK` | `mainnet-beta` | Production | Plain Text |
| `NEXT_PUBLIC_RPC_URL` | `https://mainnet.helius-rpc.com/?api-key=XXX` | Production | Plain Text |
| `NEXT_PUBLIC_COLLECTION_ADDRESS` | `Your_Collection_Address` | Production | Plain Text |
| `IRYS_PRIVATE_KEY` | `Your_Base58_Private_Key` | Production | **Secret** ✓ |
| `NETWORK` | `mainnet-beta` | Production | Plain Text |

**Important:**
- Mark `IRYS_PRIVATE_KEY` as **Secret** (eye icon crossed out)
- Secrets are not visible in logs or to non-owners
- Double-check all values before deploying

### 4. Deploy

1. Click "Deploy" button
2. Wait for build (~2-3 minutes)
3. Vercel will provide a deployment URL: `https://your-project.vercel.app`

**Check Build Logs:**
- Look for any errors in the build output
- Verify environment variables are loaded
- Confirm Next.js build succeeds

### 5. Configure Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your domain: `descireviews.com`
3. Configure DNS records as instructed
4. Enable HTTPS (automatic)

---

## Post-Deployment Testing

### Checklist

#### 1. Basic Functionality

```bash
# Test in browser
open https://your-project.vercel.app
```

- [ ] Page loads without errors
- [ ] Wallet connection button visible
- [ ] Navigation works
- [ ] Images load correctly

#### 2. Wallet Connection

- [ ] Connect Phantom wallet
- [ ] Verify wallet is on **mainnet-beta**
- [ ] Check wallet address displays correctly
- [ ] Disconnect and reconnect works

#### 3. File Upload

- [ ] Navigate to `/research/submit`
- [ ] Upload a test PDF (small file first)
- [ ] Verify upload progress shows
- [ ] Check console for Irys upload logs
- [ ] Verify Arweave URI returned

**Expected Response:**
```json
{
  "pdfUri": "https://gateway.irys.xyz/...",
  "pdfHash": "sha256:...",
  "uploaded": true,
  "message": "Arquivos enviados com sucesso para Arweave"
}
```

#### 4. Verify Arweave Upload

```bash
# Open the returned URI in browser
open https://gateway.irys.xyz/YOUR_TRANSACTION_ID

# PDF should display/download
```

#### 5. Check Irys Balance

```bash
# Check if upload consumed SOL
irys balance -w keypair-mainnet.json -n mainnet -t solana

# Balance should be slightly lower than before
```

### Test Scenarios

#### Happy Path
1. Connect wallet (mainnet)
2. Upload 1MB PDF
3. Upload cover image
4. Fill metadata
5. Submit form
6. Verify success message
7. Check Arweave URL works

#### Error Handling
1. Try uploading oversized file (>50MB)
2. Try uploading wrong file type
3. Try 6 uploads rapidly (rate limit test)
4. Disconnect wallet mid-upload

---

## Monitoring

### Key Metrics to Monitor

#### 1. Solana Keypair Balance

```bash
# Check daily
solana balance H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S --url mainnet-beta

# Alert if < 0.1 SOL
```

#### 2. Irys Balance

```bash
# Check weekly
irys balance -w keypair-mainnet.json -n mainnet -t solana

# Alert if < 0.1 SOL
```

#### 3. Helius RPC Usage

- Dashboard: https://dashboard.helius.dev
- Monitor request count
- Alert at 90k/day (90% of free tier)

#### 4. Vercel Logs

- Access: Vercel Dashboard > Deployments > Function Logs
- Monitor for:
  - Upload API errors
  - Rate limit triggers
  - Irys connection failures

#### 5. Error Tracking (Manual)

Watch for patterns in:
- Failed uploads
- Wallet connection issues
- Transaction timeouts
- Invalid file types

### Alerting

Set up manual alerts for:
- [ ] Keypair balance < 0.1 SOL (daily check)
- [ ] Irys balance < 0.1 SOL (weekly check)
- [ ] Helius usage > 90k requests (daily check)
- [ ] Multiple failed uploads (review logs weekly)

---

## Troubleshooting

### Issue: Build Fails on Vercel

**Symptoms:** Build logs show TypeScript errors or module not found

**Solutions:**
1. Check Node.js version (should be 18.x)
2. Verify `package.json` dependencies
3. Run `npm install` and `npm run build` locally first
4. Check Vercel build logs for specific errors

### Issue: Environment Variables Not Working

**Symptoms:** RPC errors, undefined variables in logs

**Solutions:**
1. Verify all required variables are set in Vercel
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Use `NEXT_PUBLIC_` prefix for frontend-visible vars

### Issue: Upload Fails with Irys Error

**Symptoms:** "Insufficient balance" or "Connection failed"

**Solutions:**
```bash
# Check Irys balance
irys balance -w keypair-mainnet.json -n mainnet -t solana

# Fund if low
irys fund 500000000 -w keypair-mainnet.json -n mainnet -t solana

# Verify IRYS_PRIVATE_KEY is correct in Vercel
# Check network (should be mainnet, not devnet)
```

### Issue: Wallet Won't Connect

**Symptoms:** "Network mismatch" or connection hangs

**Solutions:**
1. Verify wallet is on **mainnet-beta** (not devnet)
2. Clear browser cache and reload
3. Try different wallet (Phantom vs Solflare)
4. Check browser console for errors
5. Verify `NEXT_PUBLIC_NETWORK=mainnet-beta`

### Issue: Rate Limit Triggering Too Early

**Symptoms:** 429 error after few uploads

**Solutions:**
1. Current limit: 5 uploads/hour per IP
2. Adjust in `frontend/app/api/upload/route.ts`:
   ```typescript
   const limit = 10; // Increase if needed
   const windowMs = 60 * 60 * 1000; // Adjust time window
   ```
3. For production scale, implement Vercel KV or Upstash

### Issue: Transaction Timeouts

**Symptoms:** "Transaction not confirmed" after long wait

**Solutions:**
1. Check Solana network status: https://status.solana.com
2. Verify Helius RPC is responding
3. Increase timeout in code if needed
4. Check wallet SOL balance for transaction fees

### Issue: NFT Mint Returns Simulated Address

**Symptoms:** Mint API returns "SimulatedMintAddress..."

**Expected:** This is correct current behavior. The mint API prepares metadata but doesn't actually mint yet. For real minting, implement client-side or server-side signing as noted in the API comments.

---

## Rollback Procedures

### Vercel Instant Rollback

1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." menu > "Promote to Production"
5. Instant rollback (no build required)

### Emergency: Pause Uploads

If detecting abuse or issues:

1. Add environment variable in Vercel:
   ```
   MAINTENANCE_MODE=true
   ```

2. Update API route to check this flag:
   ```typescript
   if (process.env.MAINTENANCE_MODE === 'true') {
     return NextResponse.json(
       { error: 'System maintenance' },
       { status: 503 }
     );
   }
   ```

3. Redeploy

---

## Costs Summary

### One-Time Costs
- Collection creation: ~0.01 SOL (~$1)
- Initial setup: ~1 hour of work

### Recurring Costs (Monthly)
- Helius RPC: $0 (free tier)
- Vercel hosting: $0 (Hobby plan)
- Domain (optional): ~$1/month

### Per-Transaction Costs
- Upload PDF (10MB): ~0.001 SOL (~$0.10)
- Upload images: ~0.0005 SOL (~$0.05)
- Transaction fees: ~0.000005 SOL (~$0.0005)

### Monthly Estimate (100 papers)
- Uploads: ~0.15 SOL (~$15)
- Transaction fees: ~0.0005 SOL (~$0.05)
- **Total: ~$15/month** for 100 papers

---

## Backup and Recovery

### Critical Backups

1. **Keypair (3 copies minimum):**
   - Encrypted USB drive (primary)
   - Password manager (secondary)
   - Paper backup in safe (tertiary)

2. **Environment Variables:**
   ```bash
   # Export from Vercel
   # Store encrypted in password manager
   ```

3. **Collection Address:**
   ```
   Collection: YOUR_ADDRESS
   Network: mainnet-beta
   Created: YYYY-MM-DD
   ```

### Recovery Scenarios

**Lost Keypair Access:**
1. Use backup keypair copy
2. Update Vercel `IRYS_PRIVATE_KEY`
3. Redeploy
4. Test upload functionality

**Compromised Keypair:**
1. Create new keypair immediately
2. Transfer remaining SOL to new keypair
3. Fund new Irys account
4. Update all environment variables
5. Redeploy
6. Monitor for unauthorized transactions

**Vercel Account Locked:**
1. Contact Vercel support
2. Meanwhile, deploy to alternative (Railway, Netlify)
3. Update DNS if using custom domain

---

## Next Steps

After successful deployment:

1. [ ] Monitor for 24 hours
2. [ ] Test with real research paper
3. [ ] Share with beta testers
4. [ ] Collect feedback
5. [ ] Implement mint functionality (if desired)
6. [ ] Set up automated monitoring
7. [ ] Document any issues encountered
8. [ ] Update this guide with learnings

---

## Support

- **Technical Issues:** Open GitHub issue
- **Security Concerns:** See SECURITY.md
- **Deployment Help:** [support@descireviews.com]

---

**Last Updated:** October 28, 2024  
**Deployed Version:** 1.0.0  
**Next Review:** Monthly
