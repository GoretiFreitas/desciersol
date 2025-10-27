# deScier Frontend

> Empowering science through decentralization

Frontend Next.js para plataforma de peer review descentralizada, construída com Solana, Metaplex e Arweave.

## 🎨 Design System

Baseado no guia de marca deScier:
- **Cores**: Indigo (#302C54), Violet (#4D4095), Lilac (#958EBD), Periwinkle (#E2E6F2)
- **Tipografia**: Plus Jakarta Sans (Google Fonts)
- **Componentes**: shadcn/ui customizados
- **Temas**: Light e Dark mode

## 🚀 Setup

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Configurar Ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_COLLECTION_ADDRESS=HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6
```

### 3. Iniciar Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout + providers
│   ├── page.tsx                # Homepage
│   ├── providers.tsx           # Wallet + Theme providers
│   ├── research/
│   │   ├── submit/page.tsx    # Submit paper
│   │   └── browse/page.tsx    # Browse collection
│   └── api/
│       ├── upload/route.ts    # File upload API
│       ├── mint/route.ts      # Mint NFT API
│       └── collection/route.ts # Fetch NFTs API
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/
│   │   ├── Header.tsx         # Navigation + wallet
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── Hero.tsx           # Hero section
│   │   ├── Features.tsx       # Features grid
│   │   └── HowItWorks.tsx     # Process steps
│   └── research/
│       ├── SubmitPaperForm.tsx
│       └── PaperCard.tsx
└── lib/
    ├── utils.ts                # Utility functions
    └── constants.ts            # Config constants
```

## 🔑 Funcionalidades

### Homepage
- ✅ Hero com CTA
- ✅ Features (Metaplex, Solflare, Ar.io)
- ✅ How It Works (4 steps)
- ✅ Background grid técnico
- ✅ Dark mode

### Submit Paper
- ✅ Upload de PDF
- ✅ Form completo (título, autores, abstract, tags, DOI, license, version)
- ✅ Integração com backend scripts
- ✅ Status em tempo real
- ✅ Success com link para Explorer

### Browse Papers
- ✅ Fetch da collection
- ✅ Search por título/descrição
- ✅ Filter por tags
- ✅ Cards com metadata
- ✅ Links para Explorer e Arweave

### Wallet Integration
- ✅ Solflare, Phantom, Backpack
- ✅ Auto-connect
- ✅ Wallet button no header

## 🔌 API Routes

### POST /api/upload
Upload de arquivo PDF para Arweave
- **Input**: FormData com file
- **Output**: { uri, hash, filename, size }

### POST /api/mint
Mint NFT via backend script
- **Input**: { title, authors, description, tags, doi, license, version, uri, hash, collection }
- **Output**: { mint, metadataUri, output }

### GET /api/collection
Fetch NFTs da collection
- **Output**: { collection, count, nfts: [] }

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Solana Web3.js
- **Wallet**: @solana/wallet-adapter-react
- **NFTs**: Metaplex Foundation JS
- **Theme**: next-themes
- **Icons**: lucide-react
- **Fonts**: Plus Jakarta Sans (Google Fonts)

## 📦 Build para Produção

```bash
npm run build
npm start
```

## 🚀 Deploy (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

Ou conecte o repositório no [Vercel Dashboard](https://vercel.com).

## 🎨 Customização

### Cores
Edite `app/globals.css` - seção `:root` e `.dark`

### Componentes
Componentes em `components/ui/` seguem padrão shadcn/ui

### Fonts
Troque no `app/layout.tsx` - `Plus_Jakarta_Sans` import

## 📝 License

MIT

