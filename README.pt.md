# DeSci Reviews: O Mercado de Capitais para o Conhecimento

**DeSci Reviews é uma plataforma de publicação científica orientada para o mercado que transforma a maneira como a pesquisa é financiada, avaliada e monetizada.** Saímos do modelo tradicional de publicações para criar um ecossistema dinâmico onde o conhecimento se torna um ativo de capital, com liquidez e credibilidade on-chain.

## 🚨 **O Problema: Publicação Científica Tradicional**

O sistema atual de publicação científica está quebrado. Autores pagam taxas exorbitantes para publicar, revisores (a espinha dorsal da validação científica) não são remunerados, e o conhecimento fica preso atrás de paywalls institucionais. O resultado é um sistema que expropria o direito autoral dos criadores e limita o acesso e a liquidez das ideias.

- **Autores Pagam:** Custos de $2k a $15k por artigo
- **Revisores Não São Pagos:** O trabalho voluntário não é reconhecido ou recompensado
- **Conhecimento Preso:** Arquivos estáticos em PDF, sem visibilidade ou liquidez
- **Direitos Expropriados:** Editoras detêm o copyright, não os autores

## ✨ **A Solução: Uma Economia de Ideias na Solana**

DeSci Reviews reimagina a publicação como um evento de listagem em um mercado de ideias. Construído na blockchain da Solana, nosso protocolo oferece uma infraestrutura para transformar ativos intelectuais em ativos programáveis e negociáveis.

- **Cada Journal é um Portfólio:** Coleções curadas de ativos de conhecimento com potencial de mercado
- **Cada Artigo é um Evento de Listagem:** Publicar um artigo, protocolo ou projeto é como um "IPO de ideias", dando-lhe visibilidade e um lugar no mercado
- **Cada Revisão é uma Análise de Mercado:** As revisões de pares se tornam "analyst coverage", fornecendo credibilidade on-chain e ajudando o mercado a precificar o ativo intelectual

## 🏗️ **Como Funciona: A Arquitetura On-Chain**

Nossa infraestrutura utiliza primitivas da Solana para criar um sistema transparente, eficiente e componível.

### **Ativos de Pesquisa (pNFTs)**
Cada artigo, protocolo ou conjunto de dados é mintado como um pNFT (programmable Non-Fungible Token) usando o padrão Metaplex Core. Isso garante a proveniência, permite o pagamento automático de royalties aos criadores e confere liquidez ao ativo intelectual. Os metadados são armazenados permanentemente no Arweave, garantindo a imutabilidade.

### **Badges de Revisor (SBTs)**
Para construir um sistema de reputação robusto, emitimos Badges de Revisor como Soul-Bound Tokens (SBTs), utilizando a extensão NonTransferable do padrão SPL Token-2022. Esses badges funcionam como uma identidade on-chain, atestando a especialidade e o histórico de contribuições de cada revisor.

### **Cofre de Recompensas (Treasury)**
Um cofre descentralizado, implementado como um PDA (Program Derived Address), gerencia as recompensas para os revisores. O cofre é financiado com Liquid Staking Tokens (LSTs), como mSOL e jitoSOL, permitindo que o capital do tesouro cresça de forma sustentável enquanto recompensa as contribuições da rede.

## 🚀 **Funcionalidades Implementadas**

### **✅ Core Features**
- **Upload de PDFs** - Upload de papers de pesquisa para Arweave via Irys
- **Mint de pNFTs** - Transformar papers em NFTs programáveis na Solana
- **Armazenamento Permanente** - Dados armazenados no Arweave com imutabilidade
- **Interface Moderna** - Frontend React/Next.js com Tailwind CSS
- **Wallet Integration** - Suporte a Phantom e Solflare
- **Acessibilidade** - Conformidade WCAG AA

### **✅ Blockchain Infrastructure**
- **Metaplex Core** - Padrão NFT para ativos de pesquisa
- **Arweave Storage** - Armazenamento permanente via Irys
- **Solana Program Library** - Integração com primitivas da Solana
- **Program Derived Addresses** - PDAs para cofres e governança

## 🛠️ **Tecnologias**

### **Frontend**
- **Next.js 15** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Shadcn/ui** - Componentes UI acessíveis
- **Solana Wallet Adapter** - Integração de wallets

### **Blockchain**
- **Solana** - Blockchain principal
- **Metaplex Core** - Padrão NFT programável
- **Arweave** - Armazenamento permanente
- **Irys** - Upload para Arweave
- **SPL Token-2022** - Tokens com extensões

## 🚀 **Comece a Usar (Guia para Desenvolvedores)**

Pronto para construir o futuro da ciência? Configure seu ambiente local e comece a interagir com o protocolo DeSci Reviews.

### **1. Instale as Dependências**

```bash
# Frontend
cd frontend
npm install

# Root
cd ..
npm install
```

### **2. Configure o Ambiente**

Copie o arquivo de exemplo e edite `.env.local` com suas configurações de RPC, keypair e outros parâmetros da rede Solana.

```bash
cp env.example .env.local
```

Se você ainda não tem uma keypair, gere uma com o comando:

```bash
npx tsx scripts/utils/generate-keypair.ts
```

### **3. Principais Comandos**

Nossos scripts permitem interagir com todas as facetas do protocolo. Use `--dry-run` para simular qualquer transação sem custo.

#### **Coleções e Ativos de Pesquisa**

```bash
# Criar uma nova coleção para agrupar ativos
npx tsx scripts/assets/create-collection-metaplex.ts --name "Minha Coleção de Pesquisa"

# Mintar um novo ativo de pesquisa como um pNFT
npx tsx scripts/assets/mint-research-asset-metaplex.ts \
  --title "Protocolo de IA Generativa" \
  --authors "Autor Um,Autor Dois" \
  --hash "<sha256_do_arquivo>" \
  --uri "<uri_do_arweave>" \
  --collection <ENDERECO_DA_COLECAO>

# Upload automático para Arweave e mint
npx tsx scripts/assets/mint-auto-upload.ts \
  --file "paper.pdf" \
  --title "Título do Paper" \
  --authors "Autor1,Autor2"
```

#### **Badges e Reputação de Revisores**

```bash
# Criar o token que servirá como base para os badges de revisor
npx tsx scripts/badges/create-badge-mint.ts --name "Badge de Revisor de IA"

# Emitir um badge para um revisor específico
npx tsx scripts/badges/issue-badge.ts \
  --reviewer <PUBKEY_DO_REVISOR> \
  --mint <ENDERECO_DO_MINT_DO_BADGE> \
  --level 3
```

#### **Cofre de Recompensas**

```bash
# Inicializar o cofre de recompensas da sua comunidade
npx tsx scripts/treasury/init-vault.ts --initial-sol 1.0

# Depositar LSTs para financiar o pagamento de recompensas
npx tsx scripts/treasury/deposit-lst.ts --amount 100 --mint <MINT_DO_LST>

# Pagar um revisor por seu trabalho
npx tsx scripts/treasury/pay-reviewer.ts \
  --reviewer <PUBKEY_DO_REVISOR> \
  --amount 10 \
  --mint <MINT_DO_LST>
```

## 📱 **Interface Web**

### **1. Conectar Wallet**

1. Instalar extensão da wallet (Phantom ou Solflare)
2. Configurar para Devnet
3. Obter SOL do faucet: https://faucet.solana.com/
4. Conectar na aplicação

### **2. Mintar Paper como NFT**

1. Acessar `/research/submit`
2. Upload do PDF (máx. 50MB)
3. Upload de imagem de capa (opcional, recomendado)
4. Upload de imagem do NFT (opcional)
5. Preencher metadados (título, autores, descrição)
6. Clicar "Submit" ou "Mintar como NFT"
7. **Aprovar transação na sua wallet**
8. Aguardar confirmação (~5-10 segundos)
9. Copiar endereço do NFT e ver no Explorer!

### **3. Debug e Troubleshooting**

1. Acessar `/debug`
2. Usar "Conexão Direta da Wallet" para problemas de conexão
3. Verificar status da conexão e saúde do RPC
4. Testar detecção de wallets
5. Ver logs detalhados

## ✅ **Testado & Verificado**

### **Configuração Funcionando (Devnet)**

- **Wallet:** Solflare (Phantom também suportado)
- **Network:** Solana Devnet
- **Storage:** Arweave via Irys Devnet
- **Mint:** Assinatura client-side com Metaplex
- **Custo:** Grátis no devnet (usa SOL de teste)

### **Resultados dos Testes com Sucesso**

- ✅ **Upload de PDF:** Arquivos enviados com sucesso para Arweave via Irys devnet
- ✅ **Upload de Metadata:** JSON metadata armazenado permanentemente no Arweave
- ✅ **Mint de NFT:** NFTs criados com assinatura da wallet do usuário
- ✅ **URIs Arweave:** Todos os arquivos acessíveis via `https://gateway.irys.xyz/[ID]`
- ✅ **Solana Explorer:** NFTs visíveis e verificáveis on-chain
- ✅ **Rate Limiting:** Proteção contra abuso funcionando
- ✅ **Segurança:** Headers e validações ativos

### **Status do Irys Devnet**

- **Endpoint:** `https://devnet.irys.xyz`
- **Financiado:** ✅ 0.1 SOL (suficiente para ~100 uploads)
- **Funcionando:** ✅ Todos os uploads com sucesso
- **Custo por upload:** ~0.001 SOL (tokens de teste)

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


## 🤝 **Contribuições**

Este é um projeto de código aberto e convidamos a comunidade a contribuir. Sinta-se à vontade para abrir um Pull Request ou nos contactar com ideias.

1. Faça um Fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça o commit de suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Faça o Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 **Licença**

Distribuído sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 **Suporte**

Para problemas ou dúvidas:

1. Verificar página de debug: `/debug`
2. Verificar logs do console
3. Verificar configuração das variáveis
4. Abrir issue no GitHub

---

**Desenvolvido com ❤️ para a comunidade científica na Solana**
