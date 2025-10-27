# 🌐 Opções de Upload para Arweave - Guia Completo

**Referência**: https://docs.ar.io/build/upload/bundling-services

---

## 🎯 3 Métodos de Upload Implementados

### 1. ⭐ **Turbo (ArDrive)** - RECOMENDADO

**Por quê?**
- ✅ Aceita **SOL diretamente**
- ✅ Interface web fácil
- ✅ Suporte a múltiplos tokens (SOL, ETH, USDC, AR)
- ✅ Pode pagar com cartão de crédito!
- ✅ Infraestrutura enterprise-grade

**Como usar**:

```bash
# 1. Fazer top-up via web (MAIS FÁCIL)
# Acesse: https://turbo-topup.com
# Pague com SOL, cartão, ETH, etc

# 2. Verificar saldo
npx tsx scripts/utils/topup-turbo.ts --check-balance

# 3. Mintar NFT com Turbo
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Meu Paper" \
  --authors "Alice" \
  --hash "sha256:abc" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --upload-method turbo
```

**Custos**: ~$0.002 por metadata (2KB)

---

### 2. 🚀 **Irys V2** - TESTADO E FUNCIONANDO

**Por quê?**
- ✅ Devnet funcionando
- ✅ Upload programático
- ✅ Já testado com sucesso
- ✅ Saldo: 0.01 SOL disponível

**Como usar**:

```bash
# 1. Fazer fund (já feito!)
npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01

# 2. Verificar saldo
npx tsx scripts/utils/fund-irys-v2.ts --check-balance

# 3. Mintar NFT com Irys
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Meu Paper" \
  --authors "Alice" \
  --hash "sha256:abc" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

**Status**: ✅ **JÁ TESTADO E FUNCIONANDO!**

**NFT Criado**:
- Mint: `FyRugDAXj86ZLH2CjtgvK13TE9vTvXoLYymsE8rtGxm4`
- Metadata: https://gateway.irys.xyz/6s8rxtTTG7QjZErJGXjHnUHHEvbyGvggtX9sEDURz5bS

---

### 3. 🆓 **Placeholder** - PARA TESTES

**Por quê?**
- ✅ Grátis
- ✅ Perfeito para desenvolvimento
- ✅ NFTs funcionam normalmente

**Limitação**:
- ❌ Metadata não é publicamente acessível

**Como usar**:

```bash
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Test Paper" \
  --authors "Alice" \
  --hash "sha256:test" \
  --uri "https://arweave.net/test.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --upload-method placeholder
```

---

## 📊 Comparação

| Método | Custo | Devnet | SOL | Setup | Status |
|--------|-------|--------|-----|-------|--------|
| **Turbo** | ~$0.002 | ⚠️  Limitado | ✅ | Web UI | ⭐ Recomendado |
| **Irys V2** | ~$0.002 | ✅ | ✅ | CLI | ✅ Testado |
| **Placeholder** | 🆓 | ✅ | - | - | ✅ Funciona |

---

## 🚀 Guia Rápido: Como NÃO Usar Placeholder

### **Opção A: Turbo (Mais Fácil)** ⭐

1. **Faça top-up via web**:
   - Acesse: https://turbo-topup.com
   - Conecte Solflare
   - Pague com SOL (ou cartão!)
   - Receba Turbo Credits

2. **Mintar NFT**:
```bash
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Seu Paper" \
  --authors "Autores" \
  --hash "sha256:..." \
  --uri "https://arweave.net/..." \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --upload-method turbo
```

### **Opção B: Irys (Já Configurado)** ✅

```bash
# Já tem 0.01 SOL no Irys! (~600 uploads)
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Seu Paper" \
  --authors "Autores" \
  --hash "sha256:..." \
  --uri "https://arweave.net/..." \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

**Pronto! Já funciona agora!** ✅

---

## 💰 Custos

| Item | Turbo | Irys | Placeholder |
|------|-------|------|-------------|
| Setup | Web UI | 0.01 SOL | 🆓 |
| Por metadata (2KB) | ~$0.002 | ~$0.002 | 🆓 |
| Por paper (5MB) | ~$5 | ~$5 | 🆓 |
| Uploads possíveis | Depende do top-up | ~600 | ∞ |

---

## 🎯 Recomendação Final

### Para Desenvolvimento (Agora)
✅ **Use Irys** - já está configurado com 0.01 SOL!

```bash
# Simplesmente execute sem --use-placeholder:
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Paper" \
  --authors "Alice" \
  --hash "sha256:x" \
  --uri "https://arweave.net/x" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

### Para Produção
✅ **Use Turbo** - mais flexível, aceita múltiplas formas de pagamento

---

## 📋 Comandos Disponíveis

### Verificar Saldos
```bash
# Irys
npx tsx scripts/utils/fund-irys-v2.ts --check-balance

# Turbo
npx tsx scripts/utils/topup-turbo.ts --check-balance
```

### Fazer Fund/Top-up
```bash
# Irys (CLI)
npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01

# Turbo (Web - RECOMENDADO)
# Acesse: https://turbo-topup.com
```

### Mintar NFT (escolha o método)
```bash
# Com Turbo
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Paper" --authors "Alice" --hash "sha256:x" \
  --uri "https://arweave.net/x" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --upload-method turbo

# Com Irys (JÁ CONFIGURADO!)
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Paper" --authors "Alice" --hash "sha256:x" \
  --uri "https://arweave.net/x" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6

# Com Placeholder (grátis)
npx tsx scripts/assets/mint-with-real-metadata.ts \
  --title "Paper" --authors "Alice" --hash "sha256:x" \
  --uri "https://arweave.net/x" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --upload-method placeholder
```

---

## ✅ Resumo

**Você tem 3 opções**:

1. **Turbo** 🌐 - Faça top-up em https://turbo-topup.com (aceita SOL!)
2. **Irys** ⚡ - Já está pronto! Tem 0.01 SOL (~600 uploads)
3. **Placeholder** 🆓 - Grátis para testes

**Para usar metadata REAL agora**: Use **Irys** (já configurado)!

---

**Desenvolvido com ❤️ - Múltiplas opções de upload implementadas!**
