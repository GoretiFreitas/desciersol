'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Quote, Loader2, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

interface CitePaperProps {
  currentPaperId?: string;
  currentPaperTitle?: string;
}

export function CitePaper({ currentPaperId, currentPaperTitle }: CitePaperProps) {
  const { publicKey, connected } = useWallet();
  const [citedPaperId, setCitedPaperId] = useState('');
  const [citationText, setCitationText] = useState('');
  const [citing, setCiting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCite = async () => {
    if (!connected || !publicKey) {
      setError('Connect your wallet first');
      return;
    }

    if (!citedPaperId || !citationText) {
      setError('Fill in all fields');
      return;
    }

    try {
      setCiting(true);
      setError('');
      setSuccess(false);

      console.log('Creating citation...');
      console.log('   From paper:', currentPaperId);
      console.log('   Citing paper:', citedPaperId);
      console.log('   Citation:', citationText);

      // In production, this would:
      // 1. Add citation to the metadata of currentPaper
      // 2. Register royalty split with the cited paper's author
      // 3. Update on-chain metadata
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Citation created with royalty split!');

      setSuccess(true);
      setCitedPaperId('');
      setCitationText('');

      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      console.error('Citation error:', err);
      setError(err instanceof Error ? err.message : 'Error creating citation');
    } finally {
      setCiting(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Quote className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Connect your wallet to cite papers</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-descier-1 dark:border-descier-2">
      <CardHeader>
        <CardTitle>Cite Paper</CardTitle>
        <CardDescription>
          Cite other papers and share royalties automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Paper Info */}
        {currentPaperTitle && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">Your Paper</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {currentPaperTitle}
            </div>
          </div>
        )}

        {/* Cited Paper ID */}
        <div className="space-y-2">
          <Label htmlFor="citedPaperId">Cited Paper Mint Address</Label>
          <Input
            id="citedPaperId"
            placeholder="Ex: nkJbwgGuyhmgeuwgo4rq55y7hEsi5SnjdeiWmmvs8mg"
            value={citedPaperId}
            onChange={(e) => setCitedPaperId(e.target.value)}
            disabled={citing}
          />
        </div>

        {/* Citation Text */}
        <div className="space-y-2">
          <Label htmlFor="citationText">Citation Text</Label>
          <Textarea
            id="citationText"
            placeholder="Describe how you are citing this paper..."
            value={citationText}
            onChange={(e) => setCitationText(e.target.value)}
            rows={4}
            disabled={citing}
          />
        </div>

        {/* Royalty Split Info */}
        <div className="p-4 bg-descier-1/20 dark:bg-descier-4/10 rounded-lg border border-descier-2">
          <h4 className="text-sm font-semibold text-descier-4 dark:text-descier-1 mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Automatic Royalty Split
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
            <li>• The cited author receives 1% royalty from your paper</li>
            <li>• You keep 4% royalty</li>
            <li>• Splits are distributed automatically on-chain</li>
            <li>• Permanent tracking of citation chains</li>
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-600 dark:text-green-400">
              Citation created with royalty split configured!
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleCite}
          disabled={citing || !citedPaperId || !citationText}
          className="w-full bg-descier-1 hover:bg-descier-2 text-descier-4"
          size="lg"
        >
          {citing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Citation...
            </>
          ) : (
            <>
              <Quote className="mr-2 h-4 w-4" />
              Cite Paper with Royalty Split
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
