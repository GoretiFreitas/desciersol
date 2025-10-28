# deScier - Sistema de Ativos de Pesquisa On-Chain

**Plataforma de peer review descentralizada powered by Solana blockchain**

## 🚀 **Funcionalidades Principais**

- ✅ **Upload de PDFs** - Upload de papers de pesquisa para Arweave
- ✅ **Mint de NFTs** - Transformar papers em NFTs únicos na Solana
- ✅ **Armazenamento Permanente** - Dados armazenados no Arweave via Irys
- ✅ **Interface Moderna** - Frontend React/Next.js com Tailwind CSS
- ✅ **Wallet Integration** - Suporte a Phantom e Solflare
- ✅ **Acessibilidade** - Conformidade WCAG AA

## 📁 **Estrutura do Projeto**

```
Descier/
├── frontend/                 # Aplicação Next.js
│   ├── app/                 # Páginas e APIs
│   ├── components/          # Componentes React
│   ├── lib/                # Utilitários e validação
│   └── scripts/            # Scripts de teste
├── lib/                    # Bibliotecas Solana
├── scripts/                # Scripts de desenvolvimento
└── keypair.json           # Chave para desenvolvimento
```

## 🛠️ **Tecnologias**

### **Frontend**
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Solana Wallet Adapter** - Integração de wallets

### **Blockchain**
- **Solana** - Blockchain principal
- **Metaplex** - Padrão NFT
- **Arweave** - Armazenamento permanente
- **Irys** - Upload para Arweave

## 🚀 **Quick Start**

### **1. Instalar Dependências**

```bash
# Frontend
cd frontend
npm install

# Root
cd ..
npm install
```

### **2. Configurar Variáveis**

```bash
# Copiar arquivo de exemplo
cp env.example .env.local

# Editar variáveis necessárias
nano .env.local
```

### **3. Executar Aplicação**

```bash
# Desenvolvimento
cd frontend
npm run dev

# Acessar
http://localhost:3000
```

## 🔧 **Configuração**

### **Variáveis de Ambiente**

```bash
# .env.local
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_COLLECTION_ADDRESS=HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

### **Wallets Suportadas**

- **Phantom** - https://phantom.app/
- **Solflare** - https://solflare.com/

## 📱 **Como Usar**

### **1. Conectar Wallet**

1. Instalar extensão da wallet
2. Configurar para Devnet
3. Obter SOL do faucet: https://faucet.solana.com/
4. Conectar na aplicação

### **2. Mintar Paper como NFT**

1. Acessar `/research/submit`
2. Upload do PDF (máx. 50MB)
3. Upload de imagem de capa (opcional)
4. Upload de imagem do NFT (opcional)
5. Preencher metadados
6. Clicar "Mintar como NFT"

### **3. Debug e Troubleshooting**

1. Acessar `/debug`
2. Usar "Teste Simples da Wallet"
3. Verificar status da conexão
4. Testar APIs

## 🏗️ **Scripts Disponíveis**

### **Desenvolvimento**

```bash
# Frontend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção

# Testes
node scripts/test-wallet.js    # Testar configuração
```

### **Blockchain**

```bash
# Mint de NFT
npm run mint:metaplex

# Upload para Arweave
npm run upload:irys

# Criar coleção
npm run create:collection
```

## 📊 **APIs**

### **Upload de Arquivos**
```typescript
POST /api/upload
Content-Type: multipart/form-data

// Retorna: { pdfUri, pdfHash, coverImageUri, nftImageUri }
```

### **Mint de NFT**
```typescript
POST /api/mint
Content-Type: application/json

{
  "title": "Paper Title",
  "authors": "Author Name",
  "pdfUri": "ar://...",
  "pdfHash": "sha256...",
  "coverImageUri": "ar://...",
  "nftImageUri": "ar://..."
}
```

## 🔍 **Debug e Troubleshooting**

### **Página de Debug**
- **URL:** `http://localhost:3000/debug`
- **Funcionalidades:**
  - Teste de conexão da wallet
  - Verificação de APIs
  - Logs detalhados
  - Detecção de wallets

### **Problemas Comuns**

1. **Wallet não conecta**
   - Verificar se extensão está instalada
   - Verificar se está em Devnet
   - Recarregar página

2. **Upload falha**
   - Verificar tamanho do arquivo
   - Verificar conexão com internet
   - Verificar logs do console

3. **Mint falha**
   - Verificar se wallet está conectada
   - Verificar se tem SOL suficiente
   - Verificar se collection address está correto

## 📚 **Documentação**

- **README.md** - Este arquivo
- **env.example** - Exemplo de configuração
- **keypair.json** - Chave para desenvolvimento

## 🤝 **Contribuição**

1. Fork o projeto
2. Criar branch para feature
3. Commit das mudanças
4. Push para branch
5. Abrir Pull Request

## 📄 **Licença**

MIT License - veja arquivo LICENSE para detalhes

## 🆘 **Suporte**

Para problemas ou dúvidas:

1. Verificar página de debug: `/debug`
2. Verificar logs do console
3. Verificar configuração das variáveis
4. Abrir issue no GitHub

---

**Desenvolvido com ❤️ para a comunidade científica**