#!/bin/bash

# Exemplo de uso do Turbo CLI para upload de metadata
# Referência: https://docs.ar.io/build/upload/bundling-services

echo "🚀 Turbo CLI - Upload de Metadata para Arweave"
echo ""
echo "═══════════════════════════════════════════"
echo "Passo 1: Instalar Turbo CLI"
echo "═══════════════════════════════════════════"
echo ""
echo "npm install -g @ardrive/turbo-cli"
echo ""

echo "═══════════════════════════════════════════"
echo "Passo 2: Criar/Usar Wallet Arweave"
echo "═══════════════════════════════════════════"
echo ""
echo "# Criar nova wallet"
echo "npx permaweb/wallet > turbo-wallet.json"
echo ""
echo "# Ou use wallet existente em turbo-wallet.json"
echo ""

echo "═══════════════════════════════════════════"
echo "Passo 3: Top-up (Comprar Credits)"
echo "═══════════════════════════════════════════"
echo ""
echo "OPÇÃO A (RECOMENDADO): Via Web Interface"
echo "  1. Acesse: https://turbo-topup.com"
echo "  2. Conecte Solflare Wallet"
echo "  3. Pague com SOL (ou cartão/ETH/USDC)"
echo "  4. Receba Turbo Credits instantaneamente"
echo ""
echo "OPÇÃO B: Via CLI com SOL"
echo "  turbo top-up \\"
echo "    --token solana \\"
echo "    --amount 0.01 \\"
echo "    --wallet-file turbo-wallet.json"
echo ""

echo "═══════════════════════════════════════════"
echo "Passo 4: Criar Metadata JSON"
echo "═══════════════════════════════════════════"
echo ""
cat > /tmp/example-metadata.json << 'EOF'
{
  "name": "Machine Learning Protocol",
  "symbol": "RA",
  "description": "Protocolo de ML para diagnóstico médico",
  "image": "https://arweave.net/image.png",
  "external_url": "https://research-assets.io",
  "attributes": [
    {
      "trait_type": "File Hash",
      "value": "sha256:a1b2c3d4e5f6g7h8"
    },
    {
      "trait_type": "Authors",
      "value": "Dr. Alice Silva, Dr. Bob Santos"
    },
    {
      "trait_type": "DOI",
      "value": "10.1234/research.2024.001"
    },
    {
      "trait_type": "License",
      "value": "CC-BY-4.0"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "https://arweave.net/paper.pdf",
        "type": "application/pdf",
        "hash": "sha256:a1b2c3d4e5f6g7h8"
      }
    ],
    "category": "document"
  }
}
EOF

echo "✅ Metadata criada em /tmp/example-metadata.json"
echo ""

echo "═══════════════════════════════════════════"
echo "Passo 5: Upload via Turbo CLI"
echo "═══════════════════════════════════════════"
echo ""
echo "turbo upload /tmp/example-metadata.json \\"
echo "  --wallet-file turbo-wallet.json \\"
echo "  --tag \"Content-Type:application/json\" \\"
echo "  --tag \"App-Name:Solana Research Assets\" \\"
echo "  --tag \"Data-Protocol:research-asset\""
echo ""
echo "Resultado: TX ID (exemplo: abc123def456...)"
echo ""

echo "═══════════════════════════════════════════"
echo "Passo 6: Usar TX ID no NFT"
echo "═══════════════════════════════════════════"
echo ""
echo "npx tsx scripts/assets/mint-research-asset-metaplex.ts \\"
echo "  --title \"Machine Learning Protocol\" \\"
echo "  --authors \"Dr. Alice,Dr. Bob\" \\"
echo "  --hash \"sha256:a1b2c3d4e5f6g7h8\" \\"
echo "  --uri \"https://arweave.net/SEU_TX_ID_AQUI\" \\"
echo "  --collection HJVNDU6GDgg1aCPkndZhrjiuYTqLHYzj4vXjJUgFQdd6"
echo ""

echo "═══════════════════════════════════════════"
echo "🎉 NFT Criado com Metadata REAL!"
echo "═══════════════════════════════════════════"
echo ""
echo "Metadata acessível em:"
echo "  https://arweave.net/SEU_TX_ID"
echo ""
echo "NFT visível em:"
echo "  - Solflare Wallet"
echo "  - Phantom Wallet"
echo "  - Solana Explorer"
echo "  - Marketplaces"
echo ""

echo "💰 Custo Total:"
echo "  Top-up: \$5 USD"
echo "  Upload: ~\$0.002"
echo "  NFT mint: ~\$0.002"
echo "  Total: ~\$5.004"
echo ""

echo "📊 Uploads Possíveis:"
echo "  Com \$5 de credits: ~2500 metadatas"
echo ""

echo "🎯 Próximos Passos:"
echo "  1. Execute este exemplo"
echo "  2. Veja metadata real no Arweave"
echo "  3. Crie mais NFTs com metadata permanente"
echo "  4. Migre para mainnet quando pronto"
echo ""
