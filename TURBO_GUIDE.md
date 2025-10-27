# 🚀 Guia Completo - Turbo (ArDrive) para Upload Real

**Referência Oficial**: https://docs.ar.io/build/upload/bundling-services

---

## 🌐 O Que é Turbo?

Turbo é o serviço de upload **mais confiável** para Arweave, oferecendo:

- ✅ **Aceita SOL diretamente** (sem conversões!)
- ✅ **Aceita cartão de crédito**
- ✅ Infraestrutura enterprise-grade
- ✅ Múltiplas opções de pagamento (SOL, ETH, USDC, AR, MATIC, ARIO)
- ✅ Interface web e SDK

---

## 🚀 Método 1: Turbo CLI (Mais Simples)

### Instalação

```bash
npm install -g @ardrive/turbo-cli
```

### Configuração

```bash
# Criar wallet Arweave (para Turbo)
npx permaweb/wallet > turbo-wallet.json

# Ou use sua wallet existente
```

### Top-up (Comprar Credits)

**Opção A: Via Web** (RECOMENDADO) 🌐
```bash
# Abra no browser
open https://turbo-topup.com

# Conecte Solflare, pague com SOL!
```

**Opção B: Via CLI com SOL**
```bash
turbo top-up \
  --token solana \
  --amount 0.01 \
  --wallet-file turbo-wallet.json
```

### Upload de Metadata

```bash
# Criar arquivo metadata.json
cat > metadata.json << 'EOF'
{
  "name": "Meu Paper de Pesquisa",
  "symbol": "RA",
  "description": "Protocolo de Machine Learning",
  "image": "https://arweave.net/image.png",
  "attributes": [
    {"trait_type": "File Hash", "value": "sha256:abc123..."},
    {"trait_type": "Authors", "value": "Dr. Alice, Dr. Bob"}
  ]
}
EOF

# Upload via CLI
turbo upload metadata.json \
  --wallet-file turbo-wallet.json \
  --tag "Content-Type:application/json" \
  --tag "App-Name:Research Assets"

# Resultado: TX ID que pode ser usado em https://arweave.net/TX_ID
```

### Verificar Saldo

```bash
turbo balance --wallet-file turbo-wallet.json
```

---

## 🎯 Método 2: Turbo SDK (Integrado nos Scripts)

### Setup (Já Feito!)

```bash
npm install @ardrive/turbo-sdk
```

### Usar nos Scripts

```bash
# Opção 1: Via Web Top-up (Mais Fácil)
# 1. Faça top-up: https://turbo-topup.com (conecte Solflare, pague com SOL)
# 2. Mintar NFT:
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Meu Paper" \
  --authors "Dr. Alice" \
  --hash "sha256:abc123" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --upload-method turbo

# Opção 2: Teste primeiro
npx tsx scripts/utils/test-turbo.ts
```

---

## 💰 Workflow Completo Recomendado

### Passo 1: Top-up via Web

1. **Acesse**: https://turbo-topup.com
2. **Conecte** Solflare Wallet
3. **Escolha**: SOL (Solana)
4. **Quantidade**: $5 USD (~0.03 SOL)
   - Suficiente para ~2500 uploads de metadata
5. **Confirme** a transação

### Passo 2: Criar NFT com Metadata REAL

```bash
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Protocolo de Deep Learning" \
  --authors "Dr. Alice Silva,Dr. Bob Santos" \
  --hash "sha256:a1b2c3d4e5f6g7h8" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --doi "10.1234/research.2024.001" \
  --license "CC-BY-4.0" \
  --version "1.0.0" \
  --upload-method turbo
```

### Passo 3: Verificar Metadata

Aguarde 30-60 segundos, depois acesse:
```
https://arweave.net/SEU_TX_ID
```

**Resultado**: JSON completo da metadata acessível! ✅

---

## 📊 Comparação: CLI vs SDK

| Critério | Turbo CLI | Turbo SDK | Irys |
|----------|-----------|-----------|------|
| **Setup** | Global install | Já integrado | Configurado |
| **Top-up** | Via CLI ou web | Via web | Via CLI |
| **Uso** | Terminal | Scripts automatizados | Scripts |
| **Flexibilidade** | Manual | Automático | Automático |
| **Recomendado para** | Uploads manuais | Produção | Produção |

---

## 🎯 Recomendação por Caso de Uso

### Para Upload Manual de Arquivos
```bash
# Use Turbo CLI
turbo upload paper.pdf --wallet-file turbo-wallet.json
```

### Para Automatizar em Scripts (Produção)
```bash
# Use SDK integrado
npx tsx scripts/assets/mint-with-real-metadata.ts --upload-method turbo
```

### Para Testes/Desenvolvimento
```bash
# Use Irys (já configurado!)
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts
```

---

## 💡 Solução Mais Simples AGORA

### **Use Irys** (Já Está Pronto!)

Você já tem **0.01 SOL no Irys** = ~600 uploads!

```bash
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Paper Teste Real" \
  --authors "Dr. Alice" \
  --hash "sha256:teste123" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

**Metadata será REAL**: https://gateway.irys.xyz/SEU_TX_ID ✅

---

## 📋 Comandos Rápidos

### Verificar Status

```bash
# Irys (já configurado)
npx tsx scripts/utils/fund-irys-v2.ts --check-balance

# Turbo (requer top-up)
npx tsx scripts/utils/topup-turbo.ts --check-balance
```

### Fazer Top-up/Fund

```bash
# Turbo - Via Web (RECOMENDADO)
open https://turbo-topup.com

# Irys - Via CLI (já feito)
npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01
```

### Testar Upload

```bash
# Turbo
npx tsx scripts/utils/test-turbo.ts

# Irys (já testado e funcionando!)
npx tsx scripts/utils/test-irys-v2.ts
```

### Mintar NFT

```bash
# Com Turbo (requer top-up)
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Paper" --authors "Alice" \
  --hash "sha256:x" --uri "https://arweave.net/x" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --upload-method turbo

# Com Irys (JÁ PRONTO!)
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Paper" --authors "Alice" \
  --hash "sha256:x" --uri "https://arweave.net/x" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

---

## 🎉 Resumo

**Você tem 3 opções implementadas**:

1. **Turbo SDK** ✅ - Top-up via web (aceita SOL, cartão)
2. **Irys V2** ✅ - Já configurado (0.01 SOL = ~600 uploads)
3. **Placeholder** ✅ - Grátis para testes

**Para NÃO usar placeholder**:

### AGORA (Sem Setup):
```bash
# Use Irys (já pronto!)
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Seu Paper" ...
```

### COM TOP-UP WEB (Mais Flexível):
1. Top-up: https://turbo-topup.com
2. Use: `--upload-method turbo`

---

**Sistema completo com múltiplas opções de upload REAL!** 🚀
