import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileCheck, Award, Coins } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Submit Your Paper',
    description: 'Upload your research paper or dataset. We calculate a SHA-256 hash and store it permanently on Arweave.',
  },
  {
    number: '02',
    icon: FileCheck,
    title: 'Mint as NFT',
    description: 'Your work is minted as a Metaplex NFT with configurable royalties. Metadata includes authors, DOI, and file hash.',
  },
  {
    number: '03',
    icon: Award,
    title: 'Get Reviewed',
    description: 'Expert reviewers stake LSTs and earn rewards for quality peer reviews. Build on-chain reputation with SBT badges.',
  },
  {
    number: '04',
    icon: Coins,
    title: 'Earn Royalties',
    description: 'Automated royalty splits ensure you earn every time your work is cited, licensed, or reused.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-bg-periwinkle dark:from-brand-indigo/20 dark:to-brand-violet/10">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            How It Works
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl mx-auto">
            From submission to recognition, every step is transparent and verifiable on-chain
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line (hidden on mobile, last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-brand-violet to-brand-lilac/50" />
              )}
              
              <Card className="relative z-10 text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-12 pb-8 px-6">
                  {/* Number Badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-violet to-brand-violet-2 flex items-center justify-center text-white font-bold text-lg shadow-soft">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-brand-lilac/20 dark:bg-brand-violet/20 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-brand-violet" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

