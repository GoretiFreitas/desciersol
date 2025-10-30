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
Cada artigo, protocolo ou conjunto de dados é mintado como um pNFT (programmable Non-Fungible Token) usando o padrão Metaplex Core. Isso garante a proveniência, permite o pagamento automático de royalties aos criadores e confere liquidez ao ativo intelectual. Os metadados são armazenados permanentemente no Arweave via Irys, garantindo a imutabilidade.

### **Badges de Revisor (SBTs)**
Para construir um sistema de reputação robusto, emitimos Badges de Revisor como Soul-Bound Tokens (SBTs), utilizando a extensão NonTransferable do padrão SPL Token-2022. Esses badges funcionam como uma identidade on-chain, atestando a especialidade e o histórico de contribuições de cada revisor.

### **Cofre de Recompensas (Treasury)**
Um cofre descentralizado gerencia as recompensas para os revisores através de staking de SOL. Revisores fazem stake de SOL para se tornarem elegíveis para recompensas, e o cofre distribui automaticamente os pagamentos baseados na qualidade e contribuições das revisões.

## 🚀 **Funcionalidades Implementadas**

### **Funcionalidades Core**
- **Upload de PDFs** - Upload de papers de pesquisa para Arweave via Irys
- **Mint de NFTs** - Transformar papers em NFTs programáveis na Solana mainnet
- **Armazenamento Permanente** - Dados armazenados no Arweave com imutabilidade
- **Sistema de Revisão** - Peer review on-chain com atualizações de metadados
- **Sistema de Badges** - Soul-Bound Tokens para reputação de revisor
- **Treasury** - Staking de SOL e distribuição de recompensas
- **Interface Moderna** - Frontend React/Next.js com Tailwind CSS
- **Integração de Wallet** - Suporte a Phantom e Solflare
- **Acessibilidade** - Conformidade WCAG AA

### **Infraestrutura Blockchain**
- **Metaplex Core** - Padrão NFT para ativos de pesquisa
- **Arweave Storage** - Armazenamento permanente via Irys
- **Solana Program Library** - Integração com primitivas da Solana
- **Program Derived Addresses** - PDAs para cofres
- **Backend Minting** - Criação de NFTs server-side com transferências para o usuário

### **Fluxo de Funcionamento**
1. Usuário conecta wallet (Phantom/Solflare) na mainnet
2. Usuário faz upload de PDF + imagens via formulário
3. Backend faz upload dos arquivos para Arweave via Irys
4. Backend faz upload dos metadados para Arweave via Irys
5. Backend cria NFT com Metaplex
6. NFT é transferido para a wallet do usuário
7. Usuário possui o NFT com referências permanentes no Arweave
8. Revisores podem submeter revisões e ganhar badges
9. Treasury gerencia staking e recompensas

## 🛠️ **Tecnologias**

### **Frontend**
- **Next.js 15** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Shadcn/ui** - Componentes UI acessíveis
- **Solana Wallet Adapter** - Integração de wallet

### **Blockchain**
- **Solana Mainnet** - Blockchain de produção
- **Metaplex Core** - Padrão NFT programável
- **Arweave** - Armazenamento permanente
- **Irys** - Serviço de upload Arweave
- **SPL Token-2022** - Tokens com extensões
- **Helius RPC** - Acesso confiável à mainnet

## 🚀 **Como Começar**

### **Pré-requisitos**
- Node.js 18+ e npm
- Solana wallet (Phantom ou Solflare)
- SOL da mainnet para transações

### **1. Clonar e Instalar**
```bash
git clone https://github.com/yourusername/descier.git
cd descier

# Instalar dependências do frontend
cd frontend
npm install

# Voltar para a raiz
cd ..
npm install
```

### **2. Configurar Ambiente**

Crie `frontend/.env.local`:

```env
# Configuração de Rede - MAINNET
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY
NETWORK=mainnet-beta

# Backend Keypair (NUNCA commitar isso!)
IRYS_PRIVATE_KEY=your_base58_private_key_here

# Endereços das Coleções - MAINNET
NEXT_PUBLIC_COLLECTION_ADDRESS=7K2jbK53iw4oNftvbyNBMQVA6tQJUrQAWz1nJKdeWRTC
NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS=FWdnCLxzU3hFhXuqBwevLUBe1fyPpJaGn1uXme9C5MZi

# Endereço do Vault
NEXT_PUBLIC_VAULT_ADDRESS=Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6
```

### **3. Iniciar Servidor de Desenvolvimento**
```bash
cd frontend
npm run dev
```

Acesse: http://localhost:3000

## 📱 **Interface Web**

### **Funcionalidades**

#### **Navegar pelos Papers de Pesquisa**
- Ver todos os NFTs publicados na coleção
- Buscar por título, autores ou tags
- Filtrar por versão, licença ou área
- Ver metadados on-chain

#### **Submeter Paper de Pesquisa**
1. Conecte sua wallet
2. Faça upload do PDF (max 50MB)
3. Faça upload de imagens de capa e NFT
4. Preencha os metadados
5. Clique em "Submit"
6. Aprove a transação

#### **Revisar Papers de Pesquisa**
1. Navegue pelos papers disponíveis
2. Selecione um paper para revisar
3. Submeta revisão detalhada
4. Ganhe badges conforme progride
5. Revisões atualizam metadados dos NFTs on-chain

#### **Dashboard do Revisor**
- Ver seus badges
- Acompanhar contagem de revisões
- Monitorar nível de reputação
- Ver status de staking

#### **Treasury**
- Faça stake de SOL para se tornar revisor
- Resgate recompensas por revisões
- Monitore saldo do cofre
- Acompanhe citações e royalties

## 🚀 **Deploy para Produção**

### **Deploy na Vercel**

1. **Crie vercel.json** na raiz:
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm run build",
  "framework": "nextjs",
  "outputDirectory": "frontend/.next",
  "functions": {
    "frontend/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

2. **Configure Variáveis de Ambiente na Vercel:**
   - Adicione todas as variáveis de `frontend/.env.local`
   - Marque `IRYS_PRIVATE_KEY` como secreto

3. **Deploy:**
```bash
# Via CLI
vercel --prod

# Ou via integração GitHub
# Push para branch main, Vercel faz deploy automático
```

## 📊 **Status da Produção**

### **Deployments Atuais**

- **Rede:** Solana Mainnet Beta
- **Coleção:** 7K2jbK53iw4oNftvbyNBMQVA6tQJUrQAWz1nJKdeWRTC
- **Coleção de Badges:** FWdnCLxzU3hFhXuqBwevLUBe1fyPpJaGn1uXme9C5MZi
- **Treasury:** Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6

### **Infraestrutura**
- **Storage:** Arweave via Irys
- **RPC:** Helius
- **Hosting:** Vercel (recomendado)

## 🔧 **Configuração**

### **Variáveis de Ambiente**

Veja `env.example` para opções detalhadas de configuração.

**Obrigatórias:**
- `NEXT_PUBLIC_NETWORK` - Rede (mainnet-beta ou devnet)
- `NEXT_PUBLIC_RPC_URL` - Endpoint RPC
- `IRYS_PRIVATE_KEY` - Backend keypair (base58)
- `NEXT_PUBLIC_COLLECTION_ADDRESS` - Coleção NFT
- `NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS` - Coleção de badges
- `NEXT_PUBLIC_VAULT_ADDRESS` - Vault do treasury

### **Wallets Suportadas**
- **Phantom** - https://phantom.app/
- **Solflare** - https://solflare.com/

**Importante:** Configure a wallet para **Mainnet** antes de conectar!

## 🏗️ **Scripts Disponíveis**

### **Frontend**
```bash
cd frontend

npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Linting
```

### **Operações Blockchain**
```bash
# Coleções
npx tsx scripts/assets/create-collection-metaplex.ts

# Badges
npx tsx scripts/badges/create-badge-mint.ts

# Treasury
npx tsx scripts/treasury/init-vault.ts
```

## 🔍 **Solução de Problemas**

### **Problemas Comuns**

1. **Wallet não conecta**
   - Verifique se a extensão está instalada
   - Confirme que a rede é mainnet
   - Recarregue a página

2. **Upload falha**
   - Verifique o tamanho do arquivo (max 50MB)
   - Confirme saldo no Irys
   - Verifique logs do console

3. **Mint falha**
   - Garanta que a wallet tem SOL para taxas
   - Verifique endereço da coleção
   - Confira conexão com a rede

4. **NFT não aparece**
   - Aguarde indexação (pode levar 30-60s)
   - Recarregue a página
   - Verifique no Solana Explorer

### **Suporte**

- **GitHub Issues:** https://github.com/yourusername/descier/issues
- **Documentação:** Veja arquivos README
- **Segurança:** Veja [SECURITY.md](./SECURITY.md)

## 🤝 **Contribuições**

Este é um projeto open-source. Aceitamos contribuições!

1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Faça suas mudanças
4. Submeta um pull request

## 📄 **Licença**

Distribuído sob a Licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

## 🆘 **Segurança**

Para preocupações de segurança:
- Revise [SECURITY.md](./SECURITY.md)
- Reporte vulnerabilidades de forma responsável
- Nunca commite chaves privadas

---

**Construído com ❤️ para a comunidade científica na Solana**
