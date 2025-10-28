import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Wallet, HardDrive, Award, TrendingUp, Lock } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Metaplex NFTs',
    description: 'Mint papers, datasets, protocols as NFTs. Provenance, royalties, and liquidity to the knowledge economy.',
    gradient: 'from-purple-500 to-violet-600',
    bgGradient: 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20',
  },
  {
    icon: Wallet,
    title: 'Solflare & Liquid Staking',
    description: 'Earn staking yield while participating in reviews. Instant liquidity with LSTs like mSOL and jitoSOL.',
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
  },
  {
    icon: HardDrive,
    title: 'Ar.io Storage',
    description: 'Decentralized, censorship-resistant permanent storage. Content hashes anchor authenticity on-chain.',
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
  },
  {
    icon: Award,
    title: 'Reviewer Badges',
    description: 'Earn on-chain reputation NFTs. Soulbound tokens represent verified expertise and review history.',
    gradient: 'from-purple-600 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
  },
  {
    icon: TrendingUp,
    title: 'Automated Royalties',
    description: 'Programmable royalties ensure authors and reviewers earn every time their work is reused.',
    gradient: 'from-violet-600 to-fuchsia-600',
    bgGradient: 'from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20',
  },
  {
    icon: Lock,
    title: 'On-Chain Marketplace',
    description: 'Composable exchange where research assets can be licensed, funded, or traded.',
    gradient: 'from-cyan-600 to-purple-600',
    bgGradient: 'from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-cyan-500/10 backdrop-blur-sm px-5 py-2 text-sm font-semibold text-purple-800 dark:text-purple-200 border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <span>⚡</span>
            <span>Powerful Features</span>
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 dark:text-white md:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
            Built for the Future of{' '}
            <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Scientific Publishing
            </span>
          </h2>
          
          <p className="text-lg text-slate-700 dark:text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Leveraging the best of Web3 infrastructure to create transparent, 
            incentivized, and decentralized peer review that empowers researchers worldwide
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group relative overflow-hidden border-2 border-slate-200/60 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2 animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardHeader className="relative">
                {/* Icon */}
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <CardDescription className="text-base leading-relaxed text-slate-700 dark:text-slate-200 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
              
              {/* Hover Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

