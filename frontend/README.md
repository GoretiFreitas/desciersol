# Frontend - Plataforma de Research Assets

Interface Next.js para submissão e visualização de research papers como NFTs na Solana.

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Ambiente

```bash
# Copiar exemplo
cp .env.example .env.local

# Editar com suas credenciais
nano .env.local
```

### 3. Configurar Irys (para upload)

Se você tem um `keypair.json` na raiz do projeto:

```bash
# Voltar para raiz do projeto
cd ..

# Converter keypair para base58
npx tsx scripts/utils/keypair-to-base58.ts

# Copiar saída para frontend/.env.local
```

Sua `.env.local` deve conter:
```env
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_COLLECTION_ADDRESS=YourCollectionAddressHere
IRYS_PRIVATE_KEY=your_base58_private_key_here
NETWORK=devnet
```

### 4. Executar Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura

```
frontend/
├── app/
│   ├── api/
│   │   ├── upload/       # API de upload para Arweave
│   │   ├── mint/         # API de mint de NFTs
│   │   └── collection/   # API de coleções
│   ├── research/
│   │   ├── submit/       # Página de submissão
│   │   └── browse/       # Página de browse
│   ├── layout.tsx        # Layout global
│   ├── page.tsx          # Home page
│   ├── providers.tsx     # Providers (Wallet, Theme)
│   └── globals.css       # Estilos globais
├── components/
│   ├── home/             # Componentes da home
│   ├── layout/           # Header, Footer
│   ├── research/         # Componentes de research
│   └── ui/               # Componentes UI reutilizáveis
├── lib/
│   ├── constants.ts      # Constantes (endereços, etc)
│   ├── utils.ts          # Utilitários gerais
│   └── validation.ts     # Validação de arquivos
└── public/               # Assets estáticos
```

## 🎯 Funcionalidades

### ✅ Implementado

- **Home Page**: Landing page com Hero, Features, How It Works
- **Wallet Connection**: Integração Solana Wallet Adapter
  - Suporte: Phantom, Solflare, Backpack, etc.
- **Submit Paper**: Formulário completo de submissão
  - Upload de PDF (até 50MB)
  - Upload de Imagem de Capa (opcional)
  - Upload de Imagem NFT (opcional)
  - Drag & drop
  - Preview de imagens
  - Validação client-side
- **Upload to Arweave**: Via Irys SDK
  - Upload real ou placeholder (configurável)
  - Cálculo de hash SHA-256
  - Tags com metadata
- **NFT Metadata**: Geração automática de metadata
  - Formato Metaplex
  - Attributes personalizados
  - Files com hash

### 🚧 Em Desenvolvimento

- **Mint Real**: Implementar mint usando Metaplex Core
- **Browse Papers**: Listar papers mintados
- **Paper Detail**: Página de detalhes do paper
- **User Profile**: Perfil com papers do usuário
- **Search & Filter**: Busca e filtros

## 📚 Componentes Principais

### FileUpload

Componente reutilizável de upload com drag-and-drop.

```tsx
import { FileUpload } from '@/components/ui/file-upload';

<FileUpload
  label="Upload PDF"
  accept=".pdf"
  maxSize={50}
  onFileSelect={setFile}
  value={file}
  showPreview={false}
/>
```

### SubmitPaperForm

Formulário completo de submissão de papers.

**Localização:** `components/research/SubmitPaperForm.tsx`

**Fluxo:**
1. Usuário conecta wallet
2. Preenche informações do paper
3. Faz upload de arquivos (PDF + imagens)
4. Submit → Upload para Arweave
5. Mint NFT com metadata

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Start produção
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Adicionar Nova Página

```bash
# Criar nova rota
mkdir app/nova-rota
touch app/nova-rota/page.tsx
```

```tsx
// app/nova-rota/page.tsx
export default function NovaRota() {
  return <div>Nova Rota</div>;
}
```

### Adicionar Componente UI

```tsx
// components/ui/novo-componente.tsx
export function NovoComponente() {
  return <div>Novo Componente</div>;
}
```

Usar em qualquer lugar:
```tsx
import { NovoComponente } from '@/components/ui/novo-componente';
```

## 🎨 Estilização

### Tailwind CSS

Este projeto usa Tailwind CSS para estilização.

**Classes customizadas:**
```css
/* globals.css */
.brand-violet { /* Cor primária */ }
.brand-blue { /* Cor secundária */ }
```

### Shadcn/ui

Componentes base do shadcn/ui:
- Button
- Input
- Card
- Badge
- Label
- Textarea

**Adicionar novo componente shadcn:**
```bash
npx shadcn@latest add [component-name]
```

### Dark Mode

Tema claro/escuro automático com `next-themes`.

```tsx
import { useTheme } from 'next-themes';

function Component() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

## 🔌 APIs

### Upload API

**Endpoint:** `POST /api/upload`

**Body:** FormData
```typescript
{
  pdf: File,           // Obrigatório
  coverImage?: File,   // Opcional
  nftImage?: File      // Opcional
}
```

**Response:**
```json
{
  "pdfUri": "https://gateway.irys.xyz/...",
  "pdfHash": "sha256:...",
  "coverImageUri": "https://gateway.irys.xyz/...",
  "nftImageUri": "https://gateway.irys.xyz/...",
  "uploaded": true,
  "message": "Arquivos enviados com sucesso"
}
```

### Mint API

**Endpoint:** `POST /api/mint`

**Body:** JSON
```json
{
  "title": "Paper Title",
  "authors": "Alice, Bob",
  "description": "Abstract...",
  "pdfUri": "https://arweave.net/...",
  "pdfHash": "sha256:...",
  "coverImageUri": "https://arweave.net/...",
  "nftImageUri": "https://arweave.net/...",
  "collection": "CollectionAddress",
  "wallet": "WalletAddress"
}
```

**Response:**
```json
{
  "mint": "NFT_ADDRESS",
  "metadata": { /* NFT metadata */ }
}
```

## 🧪 Testes

### Modo Desenvolvimento (sem Irys)

Para testar sem configurar Irys:

1. **Não configure** `IRYS_PRIVATE_KEY` no `.env.local`
2. A API usará placeholders
3. Upload retornará URLs fictícias

### Modo Produção (com Irys)

Para testar com upload real:

1. Configure `IRYS_PRIVATE_KEY` no `.env.local`
2. Fund o Irys:
   ```bash
   cd ..
   npx tsx scripts/utils/fund-irys-v2.ts --amount 0.1
   ```
3. Teste upload real

## 🐛 Troubleshooting

### Erro: Module not found

```bash
# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
```

### Erro: Wallet connection failed

1. Verifique se tem extensão da wallet instalada
2. Verifique network (devnet vs mainnet)
3. Tente recarregar a página

### Erro: Upload failed

1. Verifique `IRYS_PRIVATE_KEY`
2. Verifique saldo Irys
3. Veja logs do terminal

### Erro de build

```bash
# Type check
npx tsc --noEmit

# Fix lint
npm run lint -- --fix
```

## 📦 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy produção
vercel --prod
```

**Configurar variáveis de ambiente:**
1. Acesse Vercel Dashboard
2. Settings → Environment Variables
3. Adicione todas as variáveis do `.env.example`

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t research-frontend .
docker run -p 3000:3000 research-frontend
```

## 🔒 Segurança

### Chaves Privadas

⚠️ **NUNCA commite chaves privadas!**

```bash
# .gitignore já inclui:
.env.local
.env*.local
```

### Variáveis de Ambiente

- `NEXT_PUBLIC_*`: Expostas no client
- Sem prefixo: Apenas no server (APIs)

### CORS

APIs estão configuradas para same-origin apenas.

## 📚 Documentação Adicional

- [UPLOAD_FEATURE.md](../UPLOAD_FEATURE.md) - Detalhes da funcionalidade de upload
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT License

---

**Desenvolvido com ❤️ para a comunidade científica na Solana**
