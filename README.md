# Sistema de Ativos de Pesquisa On-Chain (Solana)

Sistema completo para gerenciar ativos de pesquisa científica na blockchain Solana, incluindo pNFTs, badges de revisor SBT e cofre de recompensas com LST.

## 🏗️ Arquitetura

### Ativos On-Chain

- **pNFT de Ativo de Pesquisa**: Metaplex Core Assets com metadata no Arweave
- **Badge de Revisor (SBT)**: SPL Token-2022 com extensão NonTransferable (soulbound)
- **Cofre de Recompensas**: PDA simples mantendo LSTs (mSOL, jitoSOL)

### Estrutura do Projeto

```
/Users/marceloteix/Documents/Descier/
├── package.json
├── tsconfig.json
├── env.example
├── scripts/
│   ├── assets/
│   │   ├── create-collection.ts      # Criar coleção Core
│   │   ├── mint-research-asset.ts    # Mint pNFT individual
│   │   └── update-asset.ts           # Atualizar metadata
│   ├── badges/
│   │   ├── create-badge-mint.ts      # Criar token SBT
│   │   └── issue-badge.ts            # Emitir badge para revisor
│   ├── treasury/
│   │   ├── init-vault.ts             # Inicializar PDA do cofre
│   │   ├── deposit-lst.ts            # Depositar LST no cofre
│   │   └── pay-reviewer.ts           # Pagar revisor (LST ou swap)
│   └── utils/
│       ├── connection.ts             # Cliente RPC Solana
│       ├── keypair.ts                # Gestão de keypair
│       └── arweave-placeholder.ts    # Estrutura para upload futuro
├── lib/
│   ├── types.ts                        # Tipos TS (metadata, config)
│   ├── constants.ts                    # Endereços, fees, networks
│   ├── pda.ts                          # Derivação de PDAs
│   ├── wallet-adapter.ts               # Integração Solflare/Phantom/Backpack
│   ├── liquid-staking.ts               # LST (mSOL, jitoSOL, bSOL)
│   └── ario-storage.ts                 # Ar.io (Arweave) storage
├── scripts/examples/
│   ├── wallet-example.ts               # Exemplo de wallet integration
│   ├── liquid-staking-example.ts       # Exemplo de LST
│   └── ario-example.ts                 # Exemplo de Ar.io
├── README.md
└── INTEGRATION_GUIDE.md                # Guia de integrações
```

## 🚀 Setup

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Ambiente

```bash
cp env.example .env

# Gerar keypair (se necessário)
npx tsx scripts/utils/generate-keypair.ts

# Testar configuração
npx tsx scripts/test-setup.ts
```

Edite o arquivo `.env` com suas configurações:

```env
# Solana Configuration
RPC_URL=https://api.devnet.solana.com
NETWORK=devnet

# Wallet Configuration
KEYPAIR_PATH=./keypair.json

# Metaplex Configuration
CORE_PROGRAM_ID=CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
TOKEN_2022_PROGRAM_ID=TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# Treasury Configuration
TREASURY_SEED=treasury_vault
DEFAULT_ROYALTY_BASIS_POINTS=500

# LST Mints (Devnet)
MSOL_MINT=So11111111111111111111111111111111111111112
JITOSOL_MINT=J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn
```

### 3. Gerar Keypair (se necessário)

```bash
npx tsx scripts/utils/generate-keypair.ts
```

## 📖 Guias de Uso

### Coleção de Ativos

#### Criar Coleção

```bash
npx tsx scripts/assets/create-collection.ts
```

Opções disponíveis:
- `--name <nome>`: Nome da coleção (padrão: "Research Assets Collection")
- `--symbol <símbolo>`: Símbolo da coleção (padrão: "RAC")
- `--description <descrição>`: Descrição da coleção
- `--image-uri <uri>`: URI da imagem da coleção
- `--update-authority <pubkey>`: Autoridade de update
- `--dry-run`: Apenas simular, não executar

#### Mintar Asset de Pesquisa

```bash
npx tsx scripts/assets/mint-research-asset.ts \
  --title "Protocolo XYZ" \
  --authors "Alice,Bob" \
  --hash "abc123..." \
  --uri "https://arweave.net/..." \
  --collection <COLLECTION_ADDRESS>
```

Opções disponíveis:
- `--title <título>`: Título do asset (obrigatório)
- `--authors <autores>`: Lista de autores separados por vírgula (obrigatório)
- `--hash <hash>`: Hash SHA-256 do arquivo (obrigatório)
- `--uri <uri>`: URI do arquivo no Arweave (obrigatório)
- `--description <descrição>`: Descrição do asset
- `--tags <tags>`: Tags separadas por vírgula
- `--collection <pubkey>`: Endereço da coleção
- `--royalty <basisPoints>`: Royalty em basis points (padrão: 500)
- `--creators <criadores>`: Criadores e shares (formato: "pubkey1:share1,pubkey2:share2")
- `--version <versão>`: Versão do protocolo
- `--dry-run`: Apenas simular

#### Atualizar Asset

```bash
npx tsx scripts/assets/update-asset.ts \
  --asset <ASSET_ADDRESS> \
  --title "Novo Título" \
  --description "Nova descrição"
```

### Badges de Revisor (SBT)

#### Criar Mint de Badge

```bash
npx tsx scripts/badges/create-badge-mint.ts
```

Opções disponíveis:
- `--name <nome>`: Nome do badge (padrão: "Research Reviewer Badge")
- `--symbol <símbolo>`: Símbolo do badge (padrão: "RRB")
- `--description <descrição>`: Descrição do badge
- `--image-uri <uri>`: URI da imagem do badge
- `--freeze-authority <pubkey>`: Autoridade de freeze
- `--dry-run`: Apenas simular

#### Emitir Badge para Revisor

```bash
npx tsx scripts/badges/issue-badge.ts \
  --reviewer <REVIEWER_PUBKEY> \
  --mint <BADGE_MINT_ADDRESS> \
  --level 3 \
  --score 85
```

Opções disponíveis:
- `--reviewer <pubkey>`: Public key do revisor (obrigatório)
- `--mint <pubkey>`: Endereço do mint do badge (obrigatório)
- `--level <nível>`: Nível do revisor 1-5 (padrão: 1)
- `--score <score>`: Score de reputação (padrão: 0)
- `--specialties <especialidades>`: Especialidades separadas por vírgula
- `--description <descrição>`: Descrição personalizada
- `--dry-run`: Apenas simular

### Cofre de Recompensas

#### Inicializar Cofre

```bash
npx tsx scripts/treasury/init-vault.ts --initial-sol 1.0
```

Opções disponíveis:
- `--authority <pubkey>`: Autoridade do cofre (padrão: wallet atual)
- `--seed <seed>`: Seed customizado para o PDA
- `--initial-sol <amount>`: Quantidade inicial de SOL para depositar
- `--dry-run`: Apenas simular

#### Depositar LST

```bash
npx tsx scripts/treasury/deposit-lst.ts \
  --amount 100 \
  --mint <LST_MINT_ADDRESS>
```

Opções disponíveis:
- `--amount <quantidade>`: Quantidade de LST para depositar (obrigatório)
- `--mint <mint>`: Endereço do mint do LST (obrigatório)
- `--authority <pubkey>`: Autoridade do cofre
- `--dry-run`: Apenas simular

#### Pagar Revisor

```bash
npx tsx scripts/treasury/pay-reviewer.ts \
  --reviewer <REVIEWER_PUBKEY> \
  --amount 10 \
  --mint <LST_MINT_ADDRESS> \
  --note "Pagamento por revisão do paper XYZ"
```

Opções disponíveis:
- `--reviewer <pubkey>`: Public key do revisor (obrigatório)
- `--amount <quantidade>`: Quantidade de LST para pagar (obrigatório)
- `--mint <mint>`: Endereço do mint do LST (obrigatório)
- `--authority <pubkey>`: Autoridade do cofre
- `--note <nota>`: Nota/descrição do pagamento
- `--dry-run`: Apenas simular

## 🔧 Comandos Úteis

### Verificar Compilação

```bash
npm run type-check
```

### Build do Projeto

```bash
npm run build
```

### Executar Script com Debug

```bash
DEBUG=* npx tsx scripts/assets/create-collection.ts
```

## 📊 Exemplos de Uso

### Fluxo Completo

1. **Criar coleção de ativos**:
   ```bash
   npx tsx scripts/assets/create-collection.ts
   ```

2. **Mintar asset de pesquisa**:
   ```bash
   npx tsx scripts/assets/mint-research-asset.ts \
     --title "Machine Learning Protocol" \
     --authors "Alice, Bob" \
     --hash "sha256:abc123..." \
     --uri "https://arweave.net/xyz789" \
     --collection <COLLECTION_ADDRESS>
   ```

3. **Criar mint de badge SBT**:
   ```bash
   npx tsx scripts/badges/create-badge-mint.ts
   ```

4. **Emitir badge para revisor**:
   ```bash
   npx tsx scripts/badges/issue-badge.ts \
     --reviewer <REVIEWER_PUBKEY> \
     --mint <BADGE_MINT_ADDRESS> \
     --level 2
   ```

5. **Inicializar cofre**:
   ```bash
   npx tsx scripts/treasury/init-vault.ts --initial-sol 5.0
   ```

6. **Depositar LST no cofre**:
   ```bash
   npx tsx scripts/treasury/deposit-lst.ts \
     --amount 1000 \
     --mint <MSOL_MINT_ADDRESS>
   ```

7. **Pagar revisor**:
   ```bash
   npx tsx scripts/treasury/pay-reviewer.ts \
     --reviewer <REVIEWER_PUBKEY> \
     --amount 50 \
     --mint <MSOL_MINT_ADDRESS>
   ```

## 🔍 Verificações e Testes

### Verificar TypeScript

```bash
npx tsc --noEmit
```

### Testar Conexão

```bash
npx tsx -e "
import { createConnection } from './lib/connection.js';
const conn = createConnection();
console.log('✅ Conexão estabelecida:', conn.rpcEndpoint);
"
```

### Verificar Keypair

```bash
npx tsx -e "
import { loadKeypair } from './lib/keypair.js';
const kp = loadKeypair();
console.log('✅ Keypair carregado:', kp.publicKey.toString());
"
```

## ⚠️ Riscos e Considerações

### Segurança

- **Keypair local**: Não usar em produção; migrar para Squads multisig
- **RPC rate limits**: Considerar RPC pago (Helius, QuickNode) para volume
- **Validação de inputs**: Sempre validar endereços e quantidades

### Limitações Atuais

- **Arweave upload**: Implementado como placeholder; integrar Irys SDK
- **LST liquidity**: Devnet pode não ter liquidez real para swaps
- **Core vs Token Metadata**: Core é novo; verificar compatibilidade

### Custos

- **Rent exempt**: ~0.002 SOL por conta criada
- **Transações**: ~0.000005 SOL por transação
- **Arweave**: ~$0.01 por MB de dados

## 🚀 Próximos Passos

### Fase 1: Upload Real para Arweave
- [ ] Integrar @irys/sdk para upload real
- [ ] Implementar cálculo de hash SHA-256
- [ ] Adicionar retry logic para uploads

### Fase 2: Integração Jupiter
- [ ] Implementar swaps LST→SOL/USDC
- [ ] Adicionar roteamento automático
- [ ] Configurar slippage tolerance

### Fase 3: Frontend Next.js
- [ ] Interface administrativa
- [ ] Dashboard de métricas
- [ ] Gestão de coleções e assets

### Fase 4: Produção
- [ ] Migração para mainnet-beta
- [ ] Squads multisig para governance
- [ ] Auditoria de segurança

### Fase 5: Funcionalidades Avançadas
- [ ] Analytics e indexing (The Graph/Helius)
- [ ] Sistema de reputação dinâmico
- [ ] Integração com IPFS
- [ ] API REST para integrações

## 🔗 Integrações

### Solflare Wallet
- ✅ Integração com Solflare, Phantom e Backpack
- ✅ Adapter para assinar transações
- ✅ Detecção automática de wallets disponíveis

### Liquid Staking
- ✅ Suporte para mSOL (Marinade), jitoSOL (Jito) e bSOL (BlazeStake)
- ✅ Cálculo de yields e APY
- ✅ Comparação de LSTs
- ✅ Estimativas de conversão SOL ↔ LST

### Ar.io (Arweave)
- ✅ Upload de metadata e arquivos
- ✅ Cálculo de hash SHA-256
- ✅ Estimativa de custos
- ✅ Múltiplos gateways (Arweave.net, Ar.io, ArDrive)

**Consulte**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) para detalhes completos

## 📚 Documentação Adicional

- [Integration Guide](INTEGRATION_GUIDE.md) - Guia de integrações
- [Metaplex Core Documentation](https://developers.metaplex.com/core/)
- [SPL Token-2022 Program](https://spl.solana.com/token-2022)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Arweave Documentation](https://docs.arweave.org/)
- [Irys Documentation](https://docs.irys.xyz/)
- [Marinade Finance](https://docs.marinade.finance/)
- [Jito Network](https://docs.jito.network/)

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para a comunidade científica na Solana**
