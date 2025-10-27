# Guia de Integração

Este guia explica como configurar e usar as integrações com Solflare Wallet, Liquid Staking e Ar.io (Arweave).

## 🔐 Solflare Wallet Integration

### Instalação da Extensão

1. Instale a extensão Solflare:
   - **Chrome/Brave**: https://chrome.google.com/webstore/detail/solflare-wallet
   - **Firefox**: https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet/
   - **Edge**: https://microsoftedge.microsoft.com/addons/detail/solflare-wallet

2. Crie ou importe sua wallet
3. Configure para Devnet (para testes)

### Uso Programático

```typescript
import { 
  connectSolflare, 
  getWalletPublicKey, 
  getWalletAdapter 
} from './lib/wallet-adapter.js';

// Conectar wallet
const publicKey = await connectSolflare();
console.log('Conectado:', publicKey.toString());

// Obter adapter para assinar transações
const adapter = getWalletAdapter('solflare');
if (adapter) {
  const signedTx = await adapter.signTransaction(transaction);
  await connection.sendRawTransaction(signedTx.serialize());
}
```

### Wallets Suportadas

- ✅ **Solflare** - Recomendada
- ✅ **Phantom** - Popular
- ✅ **Backpack** - Moderna

### Exemplos

```bash
# Ver exemplo completo
npx tsx scripts/examples/wallet-example.ts
```

## 💰 Liquid Staking Integration

### LSTs Suportados

| LST | Protocolo | APY | TVL | Website |
|-----|-----------|-----|-----|---------|
| jitoSOL | Jito | 8.2% | 12M SOL | https://jito.network |
| bSOL | BlazeStake | 7.8% | 1.5M SOL | https://blazestake.com |
| mSOL | Marinade | 7.5% | 8.5M SOL | https://marinade.finance |

### Funcionalidades

#### 1. Comparar LSTs

```typescript
import { compareLSTs } from './lib/liquid-staking.js';

const comparison = compareLSTs('mainnet');
comparison.forEach(lst => {
  console.log(`${lst.symbol}: ${lst.apy}% APY`);
});
```

#### 2. Calcular Yields

```typescript
import { calculateYield } from './lib/liquid-staking.js';

const principal = 100; // 100 SOL
const days = 365; // 1 ano
const yield_ = calculateYield(principal, 'jitoSOL', days);
console.log(`Yield estimado: ${yield_.toFixed(4)} SOL`);
```

#### 3. Estimar Conversões

```typescript
import { estimateLSTForSOL } from './lib/liquid-staking.js';

const solAmount = 10;
const lstAmount = await estimateLSTForSOL(connection, 'mSOL', solAmount);
console.log(`${solAmount} SOL = ${lstAmount.toFixed(4)} mSOL`);
```

#### 4. Verificar Saldos

```typescript
import { getLSTBalance } from './lib/liquid-staking.js';

const balance = await getLSTBalance(connection, userPublicKey, 'jitoSOL');
console.log(`Saldo: ${balance} jitoSOL`);
```

### Integração com Cofre de Recompensas

O sistema já está configurado para aceitar os seguintes LSTs:

```typescript
// Depositar LST no cofre
npx tsx scripts/treasury/deposit-lst.ts \
  --amount 100 \
  --mint mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So

// Pagar revisor com LST
npx tsx scripts/treasury/pay-reviewer.ts \
  --reviewer <PUBKEY> \
  --amount 10 \
  --mint J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn
```

### Exemplos

```bash
# Ver exemplo completo
npx tsx scripts/examples/liquid-staking-example.ts
```

## 🌐 Ar.io (Arweave) Integration

### O que é Ar.io?

Ar.io é um gateway descentralizado para o Arweave, oferecendo:
- ✅ Storage permanente
- ✅ Redundância global
- ✅ Custo previsível
- ✅ Integração com NFTs

### Gateways Disponíveis

- **Primary**: https://arweave.net (oficial)
- **Ar.io**: https://ar-io.net (descentralizado)
- **ArDrive**: https://arweave.ar-io.dev (otimizado)

### Funcionalidades

#### 1. Upload de Metadata

```typescript
import { uploadMetadataToArweave } from './lib/ario-storage.js';

const metadata = {
  title: "Meu Paper",
  authors: ["Alice", "Bob"],
  abstract: "Resumo do trabalho...",
  version: "1.0.0"
};

const result = await uploadMetadataToArweave(metadata, {
  'Data-Protocol': 'research-asset',
  'Content-Type': 'application/json'
});

console.log('URL:', result.url);
console.log('Hash:', result.hash);
```

#### 2. Upload de Arquivos

```typescript
import { uploadToArweave } from './lib/ario-storage.js';

const result = await uploadToArweave('./paper.pdf', {
  'Content-Type': 'application/pdf',
  'File-Name': 'research-paper.pdf'
});

console.log('File URL:', result.url);
```

#### 3. Calcular Hash SHA-256

```typescript
import { calculateSHA256 } from './lib/ario-storage.js';

const hash = calculateSHA256('./paper.pdf');
console.log('SHA-256:', hash);
```

#### 4. Estimar Custos

```typescript
import { estimateUploadCost } from './lib/ario-storage.js';

const fileSize = 5 * 1024 * 1024; // 5 MB
const cost = estimateUploadCost(fileSize);
console.log(`Custo estimado: ${cost.toFixed(6)} AR`);
```

### Workflow Completo

```typescript
// 1. Preparar metadata com hash do arquivo
const fileHash = calculateSHA256('./paper.pdf');
const metadata = {
  title: "Machine Learning Protocol",
  authors: ["Dr. Alice", "Dr. Bob"],
  fileHash: fileHash,
  publishedAt: new Date().toISOString()
};

// 2. Upload de metadata
const metadataUpload = await uploadMetadataToArweave(metadata);

// 3. Upload do arquivo
const fileUpload = await uploadToArweave('./paper.pdf');

// 4. Criar NFT com URIs do Arweave
npx tsx scripts/assets/mint-research-asset.ts \
  --title "Machine Learning Protocol" \
  --authors "Dr. Alice,Dr. Bob" \
  --hash ${fileHash} \
  --uri ${fileUpload.url}
```

### Limites e Custos

| Tipo | Tamanho Máximo | Custo Estimado (1 AR = $50) |
|------|----------------|----------------------------|
| Metadata | 1 MB | ~$0.01 |
| Paper PDF | 10 MB | ~$5.12 |
| Dataset | 100 MB | ~$51.20 |

### Implementação Real

**Atualmente**: Sistema usa placeholders para testes

**Para produção**: Instalar e configurar Irys SDK

```bash
npm install @irys/sdk arweave
```

```typescript
import Irys from '@irys/sdk';

const irys = new Irys({
  url: "https://node1.irys.xyz",
  token: "solana",
  wallet: privateKey
});

const receipt = await irys.uploadFile(filePath);
console.log('TX ID:', receipt.id);
```

### Exemplos

```bash
# Ver exemplo completo
npx tsx scripts/examples/ario-example.ts
```

## 🔗 Integrações Combinadas

### Workflow Completo: Publicar Paper com Liquid Staking

```bash
# 1. Conectar Solflare Wallet (via frontend)

# 2. Upload do paper para Arweave
# (Obtém URL e hash SHA-256)

# 3. Mintar NFT do paper
npx tsx scripts/assets/mint-research-asset.ts \
  --title "Meu Paper" \
  --authors "Alice,Bob" \
  --hash <SHA256_HASH> \
  --uri <ARWEAVE_URL>

# 4. Depositar LST no cofre de recompensas
npx tsx scripts/treasury/deposit-lst.ts \
  --amount 1000 \
  --mint mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So

# 5. Emitir badge para revisores
npx tsx scripts/badges/issue-badge.ts \
  --reviewer <REVIEWER_PUBKEY> \
  --mint <BADGE_MINT> \
  --level 3 \
  --score 85

# 6. Pagar revisores com yields do LST
npx tsx scripts/treasury/pay-reviewer.ts \
  --reviewer <REVIEWER_PUBKEY> \
  --amount 10 \
  --mint mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So
```

## 🎯 Próximos Passos

### Curto Prazo
1. ✅ Integração básica com Solflare
2. ✅ Cálculos de LST yields
3. ✅ Estrutura para Ar.io uploads
4. ⏳ Implementar uploads reais para Arweave
5. ⏳ Integração com protocolos de staking

### Médio Prazo
1. Frontend Next.js com wallet adapter
2. Dashboard de performance de LSTs
3. Sistema de cache para metadata do Arweave
4. Integração com Jupiter para swaps
5. Analytics e métricas

### Longo Prazo
1. Governança DAO para o protocolo
2. Sistema de reputação on-chain
3. Marketplace de papers
4. Integração com IPFS como backup
5. Cross-chain bridges

## 📚 Recursos

- **Solflare**: https://docs.solflare.com/
- **Marinade**: https://docs.marinade.finance/
- **Jito**: https://docs.jito.network/
- **Irys (Arweave)**: https://docs.irys.xyz/
- **Ar.io**: https://ar.io/docs/
