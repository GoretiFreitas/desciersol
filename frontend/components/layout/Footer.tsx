import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import { BRAND } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-violet to-brand-violet-2 flex items-center justify-center">
                <span className="text-white font-bold text-lg">dS</span>
              </div>
              <span className="text-xl font-bold text-brand-indigo dark:text-white">
                {BRAND.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {BRAND.tagline}
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-violet transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-brand-violet transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/research/browse" className="hover:text-brand-violet transition-colors">
                  Browse Papers
                </Link>
              </li>
              <li>
                <Link href="/research/submit" className="hover:text-brand-violet transition-colors">
                  Submit Paper
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-brand-violet transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://docs.solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-violet transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://docs.metaplex.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-violet transition-colors">
                  Metaplex Docs
                </a>
              </li>
              <li>
                <a href="https://arweave.org" target="_blank" rel="noopener noreferrer" className="hover:text-brand-violet transition-colors">
                  Arweave
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-brand-violet transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-violet transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <p className="mt-1 text-xs">Built on Solana • Powered by Metaplex & Arweave</p>
        </div>
      </div>
    </footer>
  );
}

