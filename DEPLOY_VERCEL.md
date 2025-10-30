# 🚀 Guia de Deployment na Vercel

## ✅ Checklist Pré-Deploy

### 1. Variáveis de Ambiente Necessárias

Configure estas variáveis no Vercel Dashboard → Settings → Environment Variables:

```env
# Network Configuration
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
NETWORK=mainnet-beta

# Backend Keypair (MARQUE COMO SECRET!)
IRYS_PRIVATE_KEY=your_base58_private_key_here

# Collection Addresses (Mainnet)
NEXT_PUBLIC_COLLECTION_ADDRESS=7K2jbK53iw4oNftvbyNBMQVA6tQJUrQAWz1nJKdeWRTC
NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS=FWdnCLxzU3hFhXuqBwevLUBe1fyPpJaGn1uXme9C5MZi

# Vault Address
NEXT_PUBLIC_VAULT_ADDRESS=Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6
```

**⚠️ IMPORTANTE:** Marque `IRYS_PRIVATE_KEY` como "Environment Secret"!

### 2. Build Settings

Na Vercel Dashboard → Settings → General:
- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (ou `cd frontend && npm run build`)
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## 📋 Passo a Passo

### Opção A: Via Dashboard (Recomendado)

1. **Acesse:** https://vercel.com/dashboard
2. **Importe Projeto:** "Add New" → "Project" → Import from GitHub
3. **Configure:** Root Directory = `frontend`
4. **Adicione Variáveis:** Settings → Environment Variables
5. **Deploy:** Clique "Deploy"

### Opção B: Via CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd frontend
vercel --prod

# 4. Adicionar variáveis (se necessário)
vercel env add NEXT_PUBLIC_NETWORK production
# Digite: mainnet-beta

# ... repita para todas as variáveis
```

## 🧪 Testar Após Deploy

1. **Homepage** - Deve carregar
2. **Browse Papers** - Deve mostrar NFTs
3. **Connect Wallet** - Phantom/Solflare
4. **Submit Paper** - Upload + Mint
5. **Review Paper** - Submit + Badge
6. **Treasury** - Stake + Claim

## ⚠️ Possíveis Problemas

### Build Fails
- **Erro:** "Cannot find module"
- **Solução:** Verifique se `package.json` está correto

### Environment Variables Not Found
- **Erro:** "Variable not configured"
- **Solução:** Verifique variáveis na Vercel Dashboard

### API Timeout
- **Erro:** "Function execution exceeded"
- **Solução:** Configurado para 60s em `vercel.json` ✅

### Irys Upload Fails
- **Erro:** "Not enough balance"
- **Solução:** Verifique saldo no Irys

## 💰 Custos

- **Hobby:** Grátis (limitado)
- **Pro:** $20/mês (recomendado)
- **Enterprise:** Contactar

## 📊 Monitoring

```bash
vercel logs --follow
```

Ou via Dashboard → Deployments → Logs

## 🎉 Pronto!

Seu DeSci Reviews está em produção na Vercel!

**URL:** https://your-project.vercel.app

---

**Tempo estimado:** 30-60 minutos

