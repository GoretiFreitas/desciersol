'use client';

import Link from 'next/link';
import { ArrowRight, Upload, Shield, Database, Sparkles, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Hero() {
  const { connected } = useWallet();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-purple-950/30 dark:to-cyan-950/20">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse-soft" />
      <div className="absolute top-40 right-20 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-400/15 to-blue-400/15 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-violet-400/20 to-purple-400/20 blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      
      <div className="container relative mx-auto px-4 py-20 md:py-32 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col space-y-8 animate-slide-up">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-cyan-500/10 backdrop-blur-sm px-5 py-2 text-sm font-semibold text-purple-800 dark:text-purple-200 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <Sparkles className="h-4 w-4" />
                <span>Powered by Solana Blockchain</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl lg:text-7xl leading-[1.1]">
                Empowering science through{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-purple-700 via-violet-700 to-purple-700 bg-clip-text text-transparent animate-shimmer">
                    decentralization
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-violet-600/20 blur-lg -z-10" />
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200 md:text-xl max-w-2xl">
                Open peer review platform where research becomes verifiable on-chain assets. 
                Mint papers as NFTs, earn rewards for reviews, and build your reputation in the decentralized science ecosystem.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              {connected ? (
                <Link href="/research/submit" className="w-full sm:w-auto">
                  <Button size="lg" className="group w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300">
                    <Upload className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                    Submit Your Paper
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="group w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-600 opacity-60 cursor-not-allowed" disabled>
                  <Zap className="mr-2 h-5 w-5" />
                  Connect Wallet to Submit
                </Button>
              )}
              <Link href="/research/browse" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
                  <Globe className="mr-2 h-5 w-5" />
                  Browse Papers
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="space-y-1">
                <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">50+</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Papers Published</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">120+</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Reviews</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black bg-gradient-to-r from-purple-700 to-cyan-700 bg-clip-text text-transparent">30+</div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Researchers</div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative lg:block hidden animate-fade-in">
            <div className="relative h-[600px] w-full">
              {/* Floating Cards with Glass Effect */}
              <div className="absolute top-0 right-0 w-72 rounded-2xl glass-contrast shadow-xl shadow-purple-500/10 p-6 animate-float border-2 border-white/30 dark:border-slate-700/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-shadow duration-300">
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 shadow-lg mb-4">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verifiable Authenticity</h3>
                <div className="space-y-2">
                  <div className="h-2.5 w-full bg-gradient-to-r from-purple-300 to-violet-300 dark:from-purple-700/60 dark:to-violet-700/60 rounded-full animate-shimmer" />
                  <div className="h-2.5 w-4/5 bg-gradient-to-r from-purple-200 to-violet-200 dark:from-purple-700/40 dark:to-violet-700/40 rounded-full" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">On-chain verified</span>
                </div>
              </div>
              
              <div className="absolute top-40 left-0 w-72 rounded-2xl glass-contrast shadow-xl shadow-cyan-500/10 p-6 animate-float border-2 border-white/30 dark:border-slate-700/30 hover:shadow-2xl hover:shadow-cyan-500/20 transition-shadow duration-300" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg mb-4">
                  <Database className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Permanent Storage</h3>
                <div className="space-y-2">
                  <div className="h-2.5 w-full bg-gradient-to-r from-cyan-300 to-blue-300 dark:from-cyan-700/60 dark:to-blue-700/60 rounded-full" />
                  <div className="h-2.5 w-3/4 bg-gradient-to-r from-cyan-200 to-blue-200 dark:from-cyan-700/40 dark:to-blue-700/40 rounded-full animate-shimmer" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Arweave backed</span>
                </div>
              </div>
              
              <div className="absolute bottom-8 right-12 w-72 rounded-2xl glass-contrast shadow-xl shadow-violet-500/10 p-6 animate-float border-2 border-white/30 dark:border-slate-700/30 hover:shadow-2xl hover:shadow-violet-500/20 transition-shadow duration-300" style={{ animationDelay: '2s' }}>
                <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg mb-4">
                  <Upload className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Publishing</h3>
                <div className="space-y-2">
                  <div className="h-2.5 w-full bg-gradient-to-r from-violet-300 to-purple-300 dark:from-violet-700/60 dark:to-purple-700/60 rounded-full" />
                  <div className="h-2.5 w-2/3 bg-gradient-to-r from-violet-200 to-purple-200 dark:from-violet-700/40 dark:to-purple-700/40 rounded-full" />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Sub-second minting</span>
                </div>
              </div>
              
              {/* Connection Lines - Enhanced */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <line x1="50%" y1="25%" x2="15%" y2="55%" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="8,4" className="animate-pulse-soft" />
                <line x1="50%" y1="75%" x2="85%" y2="65%" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="8,4" className="animate-pulse-soft" style={{ animationDelay: '1s' }} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

