'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DirectWalletConnect() {
  const { connect, disconnect, connected, connecting, publicKey, wallet, wallets, select } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDirectConnect = async (walletName: string) => {
    try {
      setError(null);
      console.log(`🔄 Tentando conectar ${walletName}...`);
      
      // Selecionar a wallet
      const walletToSelect = wallets.find(w => w.adapter.name === walletName);
      if (!walletToSelect) {
        throw new Error(`Wallet ${walletName} não encontrada`);
      }

      console.log(`✅ Wallet encontrada:`, walletToSelect.adapter.name);
      console.log(`📋 Adapter:`, walletToSelect.adapter);
      
      // Selecionar
      select(walletToSelect.adapter.name);
      
      // Aguardar a seleção ser processada
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Conectar usando o adapter diretamente
      console.log(`🔌 Conectando...`);
      
      try {
        // Tentar conectar diretamente com o adapter
        await walletToSelect.adapter.connect();
        console.log(`✅ CONECTADO via adapter!`);
      } catch (adapterError) {
        console.log(`⚠️ Erro no adapter, tentando método padrão...`);
        await connect();
        console.log(`✅ CONECTADO via método padrão!`);
      }
      
    } catch (err: any) {
      console.error(`❌ Erro ao conectar:`, err);
      setError(err.message || 'Erro desconhecido');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Teste direto via window object
  const handleWindowConnect = async () => {
    try {
      setError(null);
      console.log('🔄 Tentando conectar via window.solflare...');
      
      if (!window.solflare) {
        throw new Error('Solflare não detectada no window object');
      }

      const result = await window.solflare.connect();
      console.log('✅ Conectado via window.solflare!', result.publicKey.toString());
      
      // Agora tentar sincronizar com o wallet adapter
      await handleDirectConnect('Solflare');
    } catch (err: any) {
      console.error('❌ Erro:', err);
      setError(err.message);
    }
  };

  if (!mounted) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Conexão Direta da Wallet</CardTitle>
        <CardDescription>
          Métodos alternativos para conectar quando o botão padrão não funciona
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Status:</span>
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? '✅ Conectado' : connecting ? '🔄 Conectando...' : '⚪ Desconectado'}
            </Badge>
          </div>
          {publicKey && (
            <div className="text-sm">
              <span className="font-semibold">Endereço:</span>
              <code className="block mt-1 p-2 bg-background rounded break-all">
                {publicKey.toString()}
              </code>
            </div>
          )}
          {wallet && (
            <div className="text-sm mt-2">
              <span className="font-semibold">Wallet:</span> {wallet.adapter.name}
            </div>
          )}
        </div>

        {/* Erros */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ <strong>Erro:</strong> {error}
            </p>
          </div>
        )}

        {/* Botões de Conexão */}
        {!connected ? (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold mb-2">Método 1: Conexão via Adapter</h3>
              <div className="flex gap-2">
                {wallets
                  .filter(w => w.readyState === 'Installed')
                  .map(w => (
                    <Button
                      key={w.adapter.name}
                      onClick={() => handleDirectConnect(w.adapter.name)}
                      disabled={connecting}
                      className="flex-1"
                    >
                      {connecting ? '🔄 Conectando...' : `🔌 Conectar ${w.adapter.name}`}
                    </Button>
                  ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <h3 className="font-semibold mb-2">Método 2: Conexão via Window Object</h3>
              <Button
                onClick={handleWindowConnect}
                disabled={connecting}
                variant="outline"
                className="w-full"
              >
                {connecting ? '🔄 Conectando...' : '🪟 Conectar via Window.solflare'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Este método tenta conectar diretamente via window.solflare
              </p>
            </div>

            <div className="border-t pt-3">
              <h3 className="font-semibold mb-2">Método 3: Console Manual</h3>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                <p className="mb-2">Copie e cole no console (F12):</p>
                <code className="block whitespace-pre-wrap break-all">
{`window.solflare?.connect()
  .then(r => console.log('✅', r.publicKey.toString()))
  .catch(e => console.error('❌', e));`}
                </code>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
            >
              🔌 Desconectar
            </Button>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ <strong>Sucesso!</strong> Wallet conectada. Agora você pode testar o upload em /research/submit
              </p>
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        <div className="border-t pt-3">
          <h3 className="font-semibold mb-2">💡 Dicas</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Verifique se a Solflare está <strong>desbloqueada</strong></li>
            <li>• Verifique se está configurada para <strong>Devnet</strong></li>
            <li>• Permita popups para localhost:3000</li>
            <li>• Se nada funcionar, use o Método 3 (Console)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Adicionar type declaration para window.solflare
declare global {
  interface Window {
    solflare?: {
      isConnected: boolean;
      publicKey: any;
      connect: () => Promise<{ publicKey: any }>;
      disconnect: () => Promise<void>;
    };
  }
}

