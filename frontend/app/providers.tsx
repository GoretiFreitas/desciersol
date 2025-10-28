'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ThemeProvider } from 'next-themes';
import { RPC_ENDPOINT } from '@/lib/constants';

// Import wallet adapter CSS
// Comentado temporariamente devido a conflito com PostCSS na Vercel
// Os estilos customizados estão em globals.css
// import '@solana/wallet-adapter-react-ui/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(
    () => {
      const walletAdapters = [];
      
      try {
        // Phantom Wallet
        if (typeof window !== 'undefined' && window.solana?.isPhantom) {
          walletAdapters.push(new PhantomWalletAdapter());
        }
        
        // Solflare Wallet
        if (typeof window !== 'undefined' && window.solflare?.isSolflare) {
          walletAdapters.push(new SolflareWalletAdapter());
        }
        
        // Fallback: adicionar adapters mesmo se não detectados
        if (walletAdapters.length === 0) {
          walletAdapters.push(
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter()
          );
        }
        
        return walletAdapters;
      } catch (error) {
        console.error('Error initializing wallet adapters:', error);
        return [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter()
        ];
      }
    },
    []
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ConnectionProvider endpoint={RPC_ENDPOINT}>
        <WalletProvider 
          wallets={wallets} 
          autoConnect={false}
          onError={(error) => {
            console.error('Wallet error:', error);
          }}
        >
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

