'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function SimpleWalletTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);

  const testWallet = async () => {
    setStatus('testing');
    setError(null);
    setWalletInfo(null);

    try {
      // Verificar se window existe
      if (typeof window === 'undefined') {
        throw new Error('Window não está disponível');
      }

      // Aguardar um pouco para garantir que a extensão carregou
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar se Solflare está disponível
      if (!window.solflare) {
        // Tentar detectar outras wallets
        const availableWallets = [];
        if (window.solana?.isPhantom) availableWallets.push('Phantom');
        if (window.solflare?.isSolflare) availableWallets.push('Solflare');
        
        throw new Error(`Solflare não está disponível. Wallets detectadas: ${availableWallets.join(', ') || 'Nenhuma'}`);
      }

      // Verificar se está conectado
      if (!window.solflare.isConnected) {
        throw new Error('Solflare não está conectado. Conecte primeiro na extensão.');
      }

      // Obter informações da wallet
      const publicKey = window.solflare.publicKey;
      const isConnected = window.solflare.isConnected;

      setWalletInfo({
        publicKey: publicKey?.toString(),
        isConnected,
        walletName: 'Solflare'
      });

      setStatus('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setStatus('error');
      console.error('Erro no teste da wallet:', err);
    }
  };

  const detectWallets = () => {
    if (typeof window === 'undefined') {
      setDetectedWallets([]);
      return;
    }

    const wallets = [];
    if (window.solana?.isPhantom) wallets.push('Phantom');
    if (window.solflare?.isSolflare) wallets.push('Solflare');
    if (window.backpack?.isBackpack) wallets.push('Backpack');
    
    setDetectedWallets(wallets);
    console.log('Wallets detectadas:', wallets);
  };

  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window não está disponível');
      }

      // Aguardar um pouco para garantir que a extensão carregou
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!window.solflare) {
        // Tentar detectar outras wallets
        const availableWallets = [];
        if (window.solana?.isPhantom) availableWallets.push('Phantom');
        if (window.solflare?.isSolflare) availableWallets.push('Solflare');
        
        throw new Error(`Solflare não está disponível. Wallets detectadas: ${availableWallets.join(', ') || 'Nenhuma'}`);
      }

      await window.solflare.connect();
      await testWallet();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar';
      setError(errorMessage);
      setStatus('error');
      console.error('Erro ao conectar wallet:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Teste Simples da Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {status === 'idle' && <div className="w-4 h-4 rounded-full bg-gray-400" />}
          {status === 'testing' && <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse" />}
          {status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
          
          <span className="font-medium">
            {status === 'idle' && 'Pronto para testar'}
            {status === 'testing' && 'Testando...'}
            {status === 'success' && 'Wallet funcionando!'}
            {status === 'error' && 'Erro detectado'}
          </span>
        </div>

        {/* Informações da Wallet */}
        {walletInfo && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Informações da Wallet
            </h4>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <div><strong>Wallet:</strong> {walletInfo.walletName}</div>
              <div><strong>Conectada:</strong> {walletInfo.isConnected ? 'Sim' : 'Não'}</div>
              <div><strong>Public Key:</strong> {walletInfo.publicKey}</div>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Erro
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Wallets Detectadas */}
        {detectedWallets.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Wallets Detectadas
            </h4>
            <div className="flex flex-wrap gap-2">
              {detectedWallets.map((wallet) => (
                <span key={wallet} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm">
                  {wallet}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={detectWallets}
            variant="outline"
            size="sm"
          >
            Detectar Wallets
          </Button>
          
          <Button
            onClick={testWallet}
            disabled={status === 'testing'}
            variant="outline"
          >
            {status === 'testing' ? 'Testando...' : 'Testar Wallet'}
          </Button>
          
          <Button
            onClick={connectWallet}
            disabled={status === 'testing'}
          >
            Conectar Solflare
          </Button>
        </div>

        {/* Instruções */}
        <div className="text-sm text-muted-foreground">
          <p><strong>Instruções:</strong></p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Certifique-se de que a extensão Solflare está instalada</li>
            <li>Clique em "Detectar Wallets" para verificar se está sendo detectada</li>
            <li>Abra a extensão e conecte sua wallet</li>
            <li>Configure para Devnet se necessário</li>
            <li>Clique em "Conectar Solflare" para testar</li>
          </ol>
          
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              <strong>Dica:</strong> Se Solflare não aparecer na lista de wallets detectadas, 
              recarregue a página (F5) e tente novamente.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Extend Window interface
declare global {
  interface Window {
    solflare?: any;
  }
}
