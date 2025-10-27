'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/constants';

export default function Header() {
  const { connected } = useWallet();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-violet to-brand-violet-2 flex items-center justify-center">
              <span className="text-white font-bold text-lg">dS</span>
            </div>
            <span className="text-xl font-bold text-brand-indigo dark:text-white">
              {BRAND.name}
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/research/browse"
              className="transition-colors hover:text-brand-violet text-foreground/80"
            >
              Browse Papers
            </Link>
            {connected && (
              <Link
                href="/research/submit"
                className="transition-colors hover:text-brand-violet text-foreground/80"
              >
                Submit Paper
              </Link>
            )}
            <Link
              href="/#how-it-works"
              className="transition-colors hover:text-brand-violet text-foreground/80"
            >
              How It Works
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}

