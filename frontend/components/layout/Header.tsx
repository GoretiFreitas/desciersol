'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTheme } from 'next-themes';
import { Moon, Sun, FileText, Upload, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/constants';

export default function Header() {
  const { connected } = useWallet();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-black text-xl">d<span className="text-cyan-300">S</span></span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 dark:from-white dark:via-purple-100 dark:to-white bg-clip-text text-transparent">
              {BRAND.name}
            </span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/research/browse"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200"
            >
              <BookOpen className="h-4 w-4" />
              Browse Papers
            </Link>
            {connected && (
              <>
                <Link
                  href="/research/submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200"
                >
                  <Upload className="h-4 w-4" />
                  Submit Paper
                </Link>
                <Link
                  href="/reviewer/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200"
                >
                  <Award className="h-4 w-4" />
                  Dashboard
                </Link>
              </>
            )}
            <Link
              href="/#how-it-works"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              How It Works
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-purple-600 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-purple-400 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-violet-600 hover:!from-purple-700 hover:!to-violet-700 !rounded-lg !shadow-lg !shadow-purple-500/30 hover:!shadow-xl hover:!shadow-purple-500/40 !transition-all !duration-300 !font-semibold" />
        </div>
      </div>
    </header>
  );
}

