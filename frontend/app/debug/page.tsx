import { WalletDebug } from '@/components/debug/WalletDebug';
import { SimpleWalletTest } from '@/components/debug/SimpleWalletTest';
import { WalletConnectionTest } from '@/components/debug/WalletConnectionTest';
import { DirectWalletConnect } from '@/components/debug/DirectWalletConnect';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            🔧 Debug Panel
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Ferramenta de diagnóstico para problemas de wallet e mint
          </p>
        </div>
        
        <div className="space-y-6">
          <DirectWalletConnect />
          <WalletConnectionTest />
          <SimpleWalletTest />
          <WalletDebug />
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Instruções de Uso
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <li>Verifique se o servidor está rodando em <code>http://localhost:3000</code></li>
            <li>Instale uma wallet (Phantom, Solflare, ou Backpack)</li>
            <li>Mude a wallet para <strong>Devnet</strong></li>
            <li>Obtenha SOL do faucet: <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer" className="underline">https://faucet.solana.com/</a></li>
            <li>Teste a conexão usando os botões acima</li>
            <li>Se tudo estiver verde, tente mintar um NFT</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
