# 🧪 Guia de Teste Local - DeSci Reviews

## ✅ Status Atual

- ✅ Servidor rodando em: http://localhost:3000
- ✅ Configuração: **DEVNET** (wallet mainnet tem saldo insuficiente: 0.00144768 SOL)
- ✅ Wallet configurada: `H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S`
- ✅ Keypair criado: `keypair-mainnet.json` (local, não commitado)
- ✅ Base58 gerado: Pronto para Irys

## 🔧 Configuração Atual

### Frontend (.env.local)
```bash
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_COLLECTION_ADDRESS=HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
IRYS_PRIVATE_KEY=2Z9iniPw6csdQprBSoxdr2CL3XKMpxgMbNpyQQDyBR4LF1SCmQexsHmc2giG2e7uwR4DacgKnKhy79fdb7hmz3ms
NETWORK=devnet
```

## 🧪 Como Testar

### 1. Acessar Aplicação

```bash
# Abrir no navegador
open http://localhost:3000
```

### 2. Conectar Wallet

**⚠️ IMPORTANTE: Configure sua wallet para DEVNET**

#### Phantom Wallet:
1. Abrir Phantom
2. Settings > Developer Settings
3. Testnet Mode: **Devnet** ✓
4. Voltar ao localhost:3000
5. Clicar em "Connect Wallet"

#### Solflare:
1. Abrir Solflare
2. Settings > Network
3. Selecionar: **Devnet** ✓
4. Voltar ao localhost:3000
5. Clicar em "Connect Wallet"

### 3. Obter SOL de Teste (se necessário)

```bash
# Via CLI
solana airdrop 2 --url devnet

# Ou via faucet web
open https://faucet.solana.com/
```

### 4. Testar Upload de Arquivo

1. Navegar para: http://localhost:3000/research/submit
2. Preparar arquivos de teste:
   - **PDF:** Qualquer PDF pequeno (1-5 MB)
   - **Cover Image (opcional):** JPG/PNG
   - **NFT Image (opcional):** JPG/PNG

3. Preencher formulário:
   - Title: "Test Paper"
   - Authors: "Test Author"
   - Description: "Testing upload functionality"
   - Tags: "test, demo"

4. Clicar "Upload Files" ou "Mintar como NFT"

5. Verificar console do navegador (F12) para logs

### 5. Verificar Resultados

**No Console (F12):**
```
🚀 Iniciando upload para Arweave via Irys...
✅ PDF uploaded: https://gateway.irys.xyz/...
✅ Upload completo!
```

**Resposta Esperada:**
```json
{
  "pdfUri": "https://gateway.irys.xyz/...",
  "pdfHash": "sha256:...",
  "uploaded": true,
  "message": "Arquivos enviados com sucesso para Arweave"
}
```

## 📊 O Que Está Funcionando

### ✅ Frontend
- [x] Servidor Next.js rodando
- [x] Wallet adapter configurado
- [x] UI responsiva
- [x] Navegação funcionando
- [x] Rate limiting implementado
- [x] Security headers ativos

### ✅ Backend APIs
- [x] `/api/upload` - Upload para Irys/Arweave
- [x] `/api/mint` - Preparação de metadata (simulado)
- [x] Rate limiting: 5 uploads/hora por IP

### ⚠️ Limitações Atuais

1. **Irys Upload:** Pode falhar se keypair devnet não tiver saldo Irys
   - Fallback: Retorna placeholders
   - Não afeta teste de interface

2. **NFT Mint:** Retorna metadata simulado (esperado)
   - API prepara metadata corretamente
   - Mint real requer implementação adicional

3. **Mainnet:** Não pode testar (saldo insuficiente)
   - Wallet precisa: ~1.5 SOL
   - Atual: 0.00144768 SOL

## 🔍 Debugging

### Verificar Logs do Servidor

Terminal onde rodou `npm run dev`:
```bash
# Logs aparecem automaticamente
# Procurar por erros em vermelho
```

### Verificar Console do Navegador

```bash
# Abrir DevTools: F12 ou Cmd+Option+I
# Tab: Console
# Procurar por:
- Erros em vermelho
- Warnings em amarelo
- Logs de upload
```

### Testar APIs Diretamente

```bash
# Test upload API (vai falhar sem arquivo, mas mostra se está respondendo)
curl http://localhost:3000/api/upload

# Deve retornar: 400 Bad Request (esperado)
```

## 🐛 Troubleshooting

### Problema: Wallet não conecta

**Solução:**
1. Verificar se wallet está em **Devnet**
2. Recarregar página (Cmd+R)
3. Tentar outra wallet (Phantom vs Solflare)
4. Verificar console para erros

### Problema: Upload falha

**Solução:**
1. Verificar tamanho do arquivo (< 50MB)
2. Verificar tipo de arquivo (PDF/JPG/PNG)
3. Ver console para erro específico
4. Verificar se rate limit não foi atingido

### Problema: Rate limit atingido

**Solução:**
```bash
# Esperar 1 hora OU
# Reiniciar servidor (limpa memória)
# Ctrl+C no terminal do npm run dev
npm run dev
```

### Problema: Página não carrega

**Solução:**
```bash
# Verificar se servidor está rodando
curl http://localhost:3000

# Se não responder, reiniciar:
cd frontend
npm run dev
```

## 🚀 Próximos Passos

### Para Testes Completos com Irys (Devnet)

1. **Verificar saldo Irys devnet:**
   ```bash
   npm install -g @irys/sdk
   irys balance -w keypair-mainnet.json -n devnet -t solana
   ```

2. **Financiar Irys devnet (se necessário):**
   ```bash
   # Primeiro, obter SOL devnet na wallet
   solana airdrop 2 H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S --url devnet
   
   # Então financiar Irys
   irys fund 100000000 -w keypair-mainnet.json -n devnet -t solana
   ```

### Para Migrar para Mainnet

**Quando wallet tiver ~1.5 SOL:**

1. **Atualizar `.env.local`:**
   ```bash
   NEXT_PUBLIC_NETWORK=mainnet-beta
   NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   NETWORK=mainnet-beta
   ```

2. **Criar collection mainnet:**
   ```bash
   NETWORK=mainnet-beta npx tsx scripts/assets/create-collection-metaplex.ts
   ```

3. **Financiar Irys mainnet:**
   ```bash
   irys fund 500000000 -w keypair-mainnet.json -n mainnet -t solana
   ```

4. **Reiniciar servidor:**
   ```bash
   # Ctrl+C
   npm run dev
   ```

## 📝 Checklist de Teste

### Testes Básicos
- [ ] Página inicial carrega
- [ ] Navegação funciona (Home, Submit, Browse)
- [ ] Wallet conecta em devnet
- [ ] Wallet desconecta
- [ ] Forms aparecem corretamente

### Testes de Upload
- [ ] Pode selecionar PDF
- [ ] Pode selecionar imagens
- [ ] Validação de tamanho funciona
- [ ] Validação de tipo funciona
- [ ] Progress bar aparece
- [ ] Sucesso/erro exibidos

### Testes de Rate Limit
- [ ] 1º upload funciona
- [ ] 2º upload funciona
- [ ] 3º upload funciona
- [ ] 4º upload funciona
- [ ] 5º upload funciona
- [ ] 6º upload bloqueado (429)

### Testes de Segurança
- [ ] Headers de segurança presentes
- [ ] Private keys não expostas no código
- [ ] HTTPS funciona (se aplicável)
- [ ] Console sem erros críticos

## 💰 Custos de Teste

### Devnet
- **SOL:** Grátis (faucet)
- **Irys uploads:** Grátis (usando SOL devnet)
- **Transações:** Grátis

### Mainnet (quando pronto)
- **Setup:** ~1.5 SOL (~$150)
- **Por upload:** ~$0.15
- **Hosting:** $0 (local ou Vercel free)

## 📞 Suporte

Se encontrar problemas:

1. **Verificar console:** F12 > Console tab
2. **Verificar server logs:** Terminal onde roda `npm run dev`
3. **Verificar configuração:** Conferir `.env.local`
4. **Reiniciar servidor:** Ctrl+C e `npm run dev`

## 🎯 Status do Teste

**Ambiente:** Localhost  
**Network:** Devnet  
**Wallet:** H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S  
**Servidor:** http://localhost:3000  
**Status:** ✅ Pronto para testar

---

**Última atualização:** 28 de outubro de 2024  
**Configuração:** Desenvolvimento/Testing  
**Próximo passo:** Testar upload e verificar funcionalidade
