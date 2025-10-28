'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useClientOnly } from '@/hooks/useClientOnly';
import { ClientOnly } from '@/components/ui/client-only';
import { ClientDebugInfo } from './ClientDebugInfo';

export function WalletDebug() {
  const { connected, connecting, disconnecting, publicKey, wallet, connect, disconnect } = useWallet();
  const { connection } = useConnection();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [rpcHealth, setRpcHealth] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [walletList, setWalletList] = useState<string[]>([]);
  const [connectError, setConnectError] = useState<string | null>(null);
  const isClient = useClientOnly();

  // Verificar saúde da conexão RPC
  useEffect(() => {
    const checkRpcHealth = async () => {
      try {
        const version = await connection.getVersion();
        setRpcHealth(version ? 'healthy' : 'error');
      } catch (error) {
        console.error('RPC Health check failed:', error);
        setRpcHealth('error');
      }
    };

    checkRpcHealth();
  }, [connection]);

  // Verificar wallets disponíveis
  useEffect(() => {
    if (!isClient) return;

    const checkWallets = () => {
      const wallets: string[] = [];
      
      if (window.solana?.isPhantom) wallets.push('Phantom');
      if (window.solflare?.isSolflare) wallets.push('Solflare');
      if (window.backpack?.isBackpack) wallets.push('Backpack');
      if (window.sollet) wallets.push('Sollet');
      
      setWalletList(wallets);
    };

    checkWallets();
    
    // Verificar novamente após 2 segundos
    const timer = setTimeout(checkWallets, 2000);
    return () => clearTimeout(timer);
  }, [isClient]);

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const version = await connection.getVersion();
      console.log('Connection test successful:', version);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    }
  };

  const testUpload = async () => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: new FormData()
      });
      
      if (response.ok) {
        console.log('Upload API test successful');
        alert('Upload API funcionando!');
      } else {
        console.error('Upload API test failed:', response.status);
        alert('Upload API com problema!');
      }
    } catch (error) {
      console.error('Upload API test failed:', error);
      alert('Upload API com erro!');
    }
  };

  const testMint = async () => {
    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test',
          authors: 'Test',
          pdfUri: 'test',
          pdfHash: 'test'
        })
      });
      
      if (response.ok) {
        console.log('Mint API test successful');
        alert('Mint API funcionando!');
      } else {
        console.error('Mint API test failed:', response.status);
        alert('Mint API com problema!');
      }
    } catch (error) {
      console.error('Mint API test failed:', error);
      alert('Mint API com erro!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Wallet Debug Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Wallet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Wallet Status</h3>
              <div className="flex items-center gap-2">
                {connected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{connected ? 'Conectada' : 'Desconectada'}</span>
              </div>
              {publicKey && (
                <p className="text-sm text-muted-foreground">
                  {publicKey.toString()}
                </p>
              )}
              {wallet && (
                <p className="text-sm text-muted-foreground">
                  Wallet: {wallet.adapter.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">RPC Status</h3>
              <div className="flex items-center gap-2">
                {rpcHealth === 'healthy' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : rpcHealth === 'error' ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
                )}
                <span>
                  {rpcHealth === 'healthy' ? 'Conectado' : 
                   rpcHealth === 'error' ? 'Erro' : 'Verificando...'}
                </span>
              </div>
            </div>
          </div>

          {/* Wallets Disponíveis */}
          <div className="space-y-2">
            <h3 className="font-semibold">Wallets Disponíveis</h3>
            <div className="flex flex-wrap gap-2">
              {walletList.length > 0 ? (
                walletList.map((wallet) => (
                  <Badge key={wallet} variant="secondary">
                    {wallet}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Nenhuma wallet detectada
                </Badge>
              )}
            </div>
          </div>

          {/* Botões de Teste */}
          <div className="space-y-2">
            <h3 className="font-semibold">Testes</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={testConnection}
                disabled={connectionStatus === 'checking'}
                variant="outline"
                size="sm"
              >
                {connectionStatus === 'checking' ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Testar RPC
              </Button>
              
              <Button
                onClick={testUpload}
                variant="outline"
                size="sm"
              >
                Testar Upload API
              </Button>
              
              <Button
                onClick={testMint}
                variant="outline"
                size="sm"
              >
                Testar Mint API
              </Button>
            </div>
          </div>

          {/* Informações de Debug */}
          <div className="space-y-2">
            <h3 className="font-semibold">Informações de Debug</h3>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              <ClientDebugInfo />
              <div>RPC Endpoint: {connection.rpcEndpoint}</div>
              <div>Network: {process.env.NEXT_PUBLIC_NETWORK || 'devnet'}</div>
            </div>
          </div>

          {/* Ações da Wallet */}
          <div className="space-y-2">
            <h3 className="font-semibold">Ações da Wallet</h3>
            <div className="flex gap-2">
              {!connected ? (
                <Button
                  onClick={async () => {
                    try {
                      setConnectError(null);
                      console.log('Tentando conectar wallet...');
                      await connect();
                      console.log('Wallet conectada com sucesso');
                    } catch (error) {
                      console.error('Erro ao conectar wallet:', error);
                      setConnectError(error instanceof Error ? error.message : 'Erro desconhecido');
                    }
                  }}
                  disabled={connecting}
                >
                  {connecting ? 'Conectando...' : 'Conectar Wallet'}
                </Button>
              ) : (
                <Button
                  onClick={() => disconnect()}
                  disabled={disconnecting}
                  variant="outline"
                  className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                >
                  {disconnecting ? 'Desconectando...' : 'Desconectar'}
                </Button>
              )}
            </div>
          </div>

          {/* Erro de Conexão */}
          {connectError && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Erro ao Conectar Wallet</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{connectError}</p>
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    <p>Possíveis soluções:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Verifique se a extensão Solflare está instalada e ativa</li>
                      <li>Recarregue a página (F5)</li>
                      <li>Verifique se a wallet está desbloqueada</li>
                      <li>Tente conectar manualmente na extensão primeiro</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Extend Window interface for wallet detection
declare global {
  interface Window {
    solana?: any;
    solflare?: any;
    backpack?: any;
    sollet?: any;
  }
}
