# 🚀 Teste Rápido de Mint (Sem Irys)

Como o Irys devnet está com problemas, vamos usar URLs temporárias para testar o **mint real do NFT**.

## ✅ **O Que Funciona**

- ✅ Wallet conectada (Solflare)
- ✅ Mint NFT com assinatura da wallet
- ✅ NFT criado no devnet
- ⚠️ Upload Irys com problema (usaremos placeholders)

## 🎯 **Teste Rápido**

### **1. Criar um Teste Simples**

Vamos usar um PDF de exemplo da internet para testar:

1. **Ir para:** http://localhost:3000/research/submit

2. **Preencher:**
   - **Title:** `Test Paper Devnet`
   - **Authors:** `Seu Nome`
   - **Description:** `Testing NFT mint functionality`
   - **Tags:** `test, demo`

3. **Upload:**
   - **PDF:** Qualquer PDF pequeno (1-5 MB)
   - **Cover/NFT Image:** Opcional

4. **Clicar:** "Submit" ou "Mintar como NFT"

### **2. O Que Vai Acontecer**

**Upload (pode falhar ou usar placeholder):**
- Se Irys falhar, sistema usa URLs placeholder
- Isso é OK para testar o mint!

**Mint (parte importante):**
- ✅ Popup da Solflare abre
- ✅ Você aprova a transação
- ✅ **NFT é criado de verdade no devnet!**
- ✅ Você recebe o mint address

## 🔧 **Solução Temporária - Usar Metadata Inline**

Vou ajustar o código para usar metadata inline (sem upload externo) para testes:

