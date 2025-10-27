# 🤖 Upload Automatizado - Ar.io Storage

**Sistema inteligente que detecta automaticamente o melhor método de upload**

---

## 🎯 Script Automatizado

### `mint-auto-upload.ts` - Upload Inteligente

**O que faz**:
1. 🔍 Detecta automaticamente qual serviço tem saldo
2. ✅ Tenta Irys primeiro (mais rápido)
3. ✅ Se não tiver, tenta Turbo
4. ✅ Se nenhum, usa placeholder
5. 🚀 Faz upload e minta o NFT

### Uso

```bash
npx tsx scripts/assets/mint-auto-upload.ts \
  --title "Meu Paper de Pesquisa" \
  --authors "Dr. Alice Silva,Dr. Bob Santos" \
  --hash "sha256:a1b2c3d4e5f6g7h8" \
  --uri "https://arweave.net/paper.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --doi "10.1234/research.2024.001" \
  --license "CC-BY-4.0"
```

**Não precisa especificar `--upload-method`!** Sistema detecta automaticamente! 🤖

---

## 🔄 Fluxo Automático

```
START
  ↓
┌─────────────────┐
│ Verificar Irys  │──► Tem saldo? ──► ✅ USA IRYS
└─────────────────┘       │
                          ↓ Não
                   ┌─────────────────┐
                   │ Verificar Turbo │──► Tem saldo? ──► ✅ USA TURBO
                   └─────────────────┘       │
                                             ↓ Não
                                      ┌──────────────────┐
                                      │ Usa Placeholder  │──► ⚠️ Não acessível
                                      └──────────────────┘
```

---

## 💰 Setup de Saldo (Uma Vez)

### Opção 1: Irys (Recomendado para Dev)

```bash
# Fund com SOL
npx tsx scripts/utils/fund-irys-v2.ts --amount 0.01

# Resultado: ~600 uploads disponíveis
```

**Status**: ✅ **JÁ FEITO! Você tem 0.01 SOL no Irys**

### Opção 2: Turbo (Recomendado para Produção)

```bash
# Top-up via web (aceita SOL, cartão, ETH)
open https://turbo-topup.com

# Ou via SDK (requer wallet Arweave)
npx tsx scripts/utils/topup-turbo.ts --amount 0.01
```

**Vantagem**: Aceita cartão de crédito! 💳

---

## 🎯 Exemplos de Uso

### Exemplo 1: Automático (Usa Irys se disponível)

```bash
npx tsx scripts/assets/mint-auto-upload.ts \
  --title "Protocolo de Deep Learning" \
  --authors "Dr. Alice,Dr. Bob,Dr. Carol" \
  --hash "sha256:abc123def456" \
  --uri "https://arweave.net/research_dl_2024.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --doi "10.1234/dl.2024.001" \
  --license "MIT" \
  --version "2.0.0" \
  --tags "machine learning,medical imaging,diagnosis"
```

**Resultado**: 
- ✅ Sistema detecta que Irys tem saldo
- ✅ Faz upload automático
- ✅ Minta NFT com metadata REAL
- ✅ URL: https://gateway.irys.xyz/TX_ID

### Exemplo 2: Forçar Placeholder (Grátis)

```bash
npx tsx scripts/assets/mint-auto-upload.ts \
  --title "Test Paper" \
  --authors "Alice" \
  --hash "sha256:test" \
  --uri "https://arweave.net/test.pdf" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6 \
  --force-placeholder
```

---

## 📊 Comparação de Scripts

| Script | Upload | Auto-Detect | Recomendado Para |
|--------|--------|-------------|------------------|
| `mint-auto-upload.ts` | ✅ Auto | ✅ | **Produção** |
| `mint-research-asset-metaplex-irys.ts` | Irys | ❌ | Dev/Testes |
| `mint-with-real-metadata.ts` | Manual | ❌ | Controle total |
| `mint-research-asset-metaplex.ts` | Placeholder | ❌ | Testes rápidos |

---

## 🚀 Workflow Produção Completo

### Setup Inicial (Uma Vez)

```bash
# 1. Fazer fund Irys (para testes/dev)
npx tsx scripts/utils/fund-irys-v2.ts --amount 0.1

# 2. Fazer top-up Turbo (para produção)
# Via web: https://turbo-topup.com
# Pague com SOL ou cartão
```

### Uso Diário

```bash
# Simplesmente execute o script automático!
npx tsx scripts/assets/mint-auto-upload.ts \
  --title "Novo Paper" \
  --authors "Autores" \
  --hash "sha256:..." \
  --uri "https://arweave.net/..." \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

**Sistema escolhe automaticamente**: Irys ou Turbo (o que tiver saldo) ✨

---

## 💡 Vantagens do Auto-Upload

1. **Zero Configuração**: Detecta automaticamente
2. **Fallback Inteligente**: Irys → Turbo → Placeholder
3. **Sempre Funciona**: Nunca falha completamente
4. **Otimizado**: Usa o método mais eficiente disponível
5. **Produção-Ready**: Sem intervenção manual

---

## 🎯 Status Atual

| Serviço | Saldo | Status | Uploads Disponíveis |
|---------|-------|--------|---------------------|
| **Irys** | 0.01 SOL | ✅ PRONTO | ~600 |
| **Turbo** | 0 winc | ⏳ Requer top-up | 0 |
| **Placeholder** | ∞ | ✅ PRONTO | ∞ |

**Sistema priorizará Irys automaticamente!** ✅

---

## 🎉 Resumo

### Para NÃO Usar Placeholder:

**AGORA (Zero Setup)**:
```bash
# Sistema usa Irys automaticamente (já tem 0.01 SOL)
npx tsx scripts/assets/mint-auto-upload.ts \
  --title "Paper" --authors "Alice" \
  --hash "sha256:x" --uri "https://arweave.net/x" \
  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

**DEPOIS (Com Top-up Turbo)**:
1. Top-up: https://turbo-topup.com
2. Execute mesmo comando
3. Sistema detectará e usará Turbo automaticamente

**Metadata será REAL e acessível!** ✅

---

**Sistema 100% automatizado com Ar.io Storage integrado!** 🚀
