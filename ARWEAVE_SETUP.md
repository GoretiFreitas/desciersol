# 🌐 Setup do Arweave - Metadata Real

## 📊 Situação Atual

### ⚠️ **Problema**: Metadata Placeholder

Atualmente, quando você acessa:
```
https://arweave.net/metadata_1761579186601_emaaz8nrz
```

Recebe:
```
Request type not found.
```

**Motivo**: Os URLs são **placeholders fictícios** - não existem de verdade no Arweave.

### ✅ **Solução**: Upload Real com Irys

Implementamos o upload REAL usando Irys (antigo Bundlr).

---

## 🚀 Como Fazer Upload Real

### Opção 1: Usar Irys com Funding (Recomendado para Produção)

#### 1. Verificar Saldo Irys

```bash
npx tsx scripts/utils/fund-irys.ts --check-balance
```

#### 2. Fazer Fund do Irys

```bash
# Depositar 0.1 SOL no Irys para uploads
npx tsx scripts/utils/fund-irys.ts --amount 0.1
```

Isso permite aproximadamente:
- ~1000 uploads de metadata (~2KB cada)
- ~20 uploads de papers pequenos (5MB cada)

#### 3. Mintar NFT com Upload Real

```bash
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Meu Paper" \
  --authors "Dr. Alice" \
  --hash "sha256:abc123" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

**Resultado**: Metadata REAL e acessível no Arweave! ✅

### Opção 2: Usar Placeholder (Atual - Para Testes)

```bash
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Meu Paper" \
  --authors "Dr. Alice" \
  --hash "sha256:abc123" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --use-placeholder
```

**Vantagem**: Não requer funding, perfeito para testes  
**Desvantagem**: Metadata não é acessível publicamente

### Opção 3: Upload Manual e Usar URI

Se preferir fazer upload manual:

1. Use https://irys.xyz/upload
2. Faça upload da metadata JSON
3. Copie o transaction ID
4. Use no comando:

```bash
npx tsx scripts/assets/mint-research-asset-metaplex.ts \
  --title "Meu Paper" \
  --authors "Alice" \
  --hash "sha256:abc123" \
  --uri "https://arweave.net/SEU_TX_ID_AQUI"
```

---

## 💰 Custos do Arweave

| Item | Tamanho | Custo (SOL) |
|------|---------|-------------|
| Metadata JSON | 2 KB | ~0.00002 SOL |
| Paper PDF | 5 MB | ~0.05 SOL |
| Dataset | 50 MB | ~0.50 SOL |

**Nota**: Preços são aproximados e variam com o mercado

---

## 🔍 Como Saber se Metadata é Real

### Placeholder (Atual)
```
URL: https://arweave.net/metadata_1761579186601_emaaz8nrz
Status: ❌ "Request type not found"
```

### Upload Real
```
URL: https://arweave.net/abc123def456...
Status: ✅ JSON acessível
Conteúdo: { "name": "...", "description": "..." }
```

---

## 🎯 Recomendação

### Para Desenvolvimento (Agora)
✅ **Use `--use-placeholder`**
- Não requer funding
- Testa toda a lógica
- NFTs funcionam normalmente
- Metadata apenas não é pública

### Para Produção (Depois)
✅ **Use Irys com funding**
- Metadata permanente
- Acessível globalmente
- Compatível com marketplaces
- Prova de integridade

---

## 📋 Comandos Rápidos

### Testar com Placeholder (Atual)
```bash
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Test Paper" \
  --authors "Alice" \
  --hash "sha256:test" \
  --uri "https://arweave.net/test.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --use-placeholder
```

### Usar Upload Real
```bash
# 1. Fund Irys
npx tsx scripts/utils/fund-irys.ts --amount 0.1

# 2. Mint com upload real
npx tsx scripts/assets/mint-research-asset-metaplex-irys.ts \
  --title "Test Paper" \
  --authors "Alice" \
  --hash "sha256:test" \
  --uri "https://arweave.net/test.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

---

## 💡 Alternativa: Metaplex Built-in Upload

O Metaplex SDK tem upload built-in que pode ser usado:

```typescript
// Usar uploadMetadata do Metaplex (usa storage driver configurado)
const { uri } = await metaplex.nfts().uploadMetadata(metadata);
```

Isso requer configurar um storage driver no Metaplex.

---

## ✅ Status Atual

| Funcionalidade | Status |
|----------------|--------|
| **Upload Placeholder** | ✅ Funcionando |
| **Irys SDK Instalado** | ✅ Completo |
| **Script de Fund** | ✅ Criado |
| **Upload Real** | ⏳ Requer funding |
| **NFTs Metaplex** | ✅ Funcionando |

**Próximo passo**: Fazer fund do Irys ou continuar com placeholders para testes.

---

**Nota**: Os NFTs criados estão 100% funcionais mesmo com metadata placeholder. A metadata só não está publicamente acessível, mas os NFTs aparecem em wallets e funcionam normalmente!
