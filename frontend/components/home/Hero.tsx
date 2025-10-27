'use client';

import Link from 'next/link';
import { ArrowRight, Upload, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Hero() {
  const { connected } = useWallet();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-bg-periwinkle to-white dark:from-brand-indigo dark:to-brand-violet/20">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid bg-dots opacity-50" />
      
      {/* Animated Nodes/Circles */}
      <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-brand-violet/20 animate-pulse-soft" />
      <div className="absolute top-40 right-20 h-32 w-32 rounded-full bg-bg-graph/30 animate-float" />
      <div className="absolute bottom-20 left-1/4 h-16 w-16 rounded-full bg-brand-lilac/20 animate-pulse-soft" />
      
      <div className="container relative mx-auto px-4 py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-brand-violet/10 px-4 py-1.5 text-sm font-semibold text-brand-violet">
                Powered by Solana Blockchain
              </div>
              <h1 className="text-5xl font-black tracking-tight text-brand-indigo dark:text-white md:text-6xl lg:text-7xl">
                Empowering science through{' '}
                <span className="bg-gradient-to-r from-brand-violet to-brand-violet-2 bg-clip-text text-transparent">
                  decentralization
                </span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-2xl">
                Open peer review platform where research becomes verifiable on-chain assets. 
                Mint papers as NFTs, earn rewards for reviews, and build your reputation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {connected ? (
                <Link href="/research/submit">
                  <Button size="lg" className="group w-full sm:w-auto">
                    Submit Your Paper
                    <Upload className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="group w-full sm:w-auto" disabled>
                  Connect Wallet to Submit
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
              <Link href="/research/browse">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse Papers
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40">
              <div>
                <div className="text-3xl font-bold text-brand-violet">50+</div>
                <div className="text-sm text-muted-foreground">Papers Published</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-violet">120+</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-violet">30+</div>
                <div className="text-sm text-muted-foreground">Researchers</div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative lg:block hidden">
            <div className="relative h-[500px] w-full">
              {/* Floating Cards Illustration */}
              <div className="absolute top-0 right-0 h-48 w-64 rounded-2xl bg-white dark:bg-brand-violet/20 shadow-soft p-6 animate-float">
                <Shield className="h-8 w-8 text-brand-violet mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-brand-lilac/30 rounded" />
                  <div className="h-3 w-24 bg-brand-lilac/20 rounded" />
                </div>
              </div>
              
              <div className="absolute top-32 left-0 h-48 w-64 rounded-2xl bg-white dark:bg-brand-violet/20 shadow-soft p-6 animate-float" style={{ animationDelay: '1s' }}>
                <Database className="h-8 w-8 text-brand-violet-2 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-brand-lilac/30 rounded" />
                  <div className="h-3 w-20 bg-brand-lilac/20 rounded" />
                </div>
              </div>
              
              <div className="absolute bottom-0 right-8 h-48 w-64 rounded-2xl bg-white dark:bg-brand-violet/20 shadow-soft p-6 animate-float" style={{ animationDelay: '2s' }}>
                <Upload className="h-8 w-8 text-brand-violet mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-36 bg-brand-lilac/30 rounded" />
                  <div className="h-3 w-28 bg-brand-lilac/20 rounded" />
                </div>
              </div>
              
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <line x1="50%" y1="30%" x2="20%" y2="50%" stroke="rgb(199, 227, 237)" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="70%" x2="80%" y2="50%" stroke="rgb(199, 227, 237)" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

