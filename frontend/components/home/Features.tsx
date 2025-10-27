import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Wallet, HardDrive, Award, TrendingUp, Lock } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Metaplex NFTs',
    description: 'Mint papers, datasets, protocols as NFTs. Provenance, royalties, and liquidity to the knowledge economy.',
    color: 'text-brand-violet',
  },
  {
    icon: Wallet,
    title: 'Solflare & Liquid Staking',
    description: 'Earn staking yield while participating in reviews. Instant liquidity with LSTs like mSOL and jitoSOL.',
    color: 'text-brand-violet-2',
  },
  {
    icon: HardDrive,
    title: 'Ar.io Storage',
    description: 'Decentralized, censorship-resistant permanent storage. Content hashes anchor authenticity on-chain.',
    color: 'text-brand-lilac',
  },
  {
    icon: Award,
    title: 'Reviewer Badges',
    description: 'Earn on-chain reputation NFTs. Soulbound tokens represent verified expertise and review history.',
    color: 'text-brand-violet',
  },
  {
    icon: TrendingUp,
    title: 'Automated Royalties',
    description: 'Programmable royalties ensure authors and reviewers earn every time their work is reused.',
    color: 'text-brand-violet-2',
  },
  {
    icon: Lock,
    title: 'On-Chain Marketplace',
    description: 'Composable exchange where research assets can be licensed, funded, or traded.',
    color: 'text-brand-lilac',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-brand-indigo/20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black text-brand-indigo dark:text-white md:text-5xl">
            Built for the Future of{' '}
            <span className="bg-gradient-to-r from-brand-violet to-brand-violet-2 bg-clip-text text-transparent">
              Scientific Publishing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leveraging the best of Web3 infrastructure to create transparent, 
            incentivized, and decentralized peer review
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-violet/50"
            >
              <CardHeader>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-brand-violet to-brand-violet-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

