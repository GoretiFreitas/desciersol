'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { COLLECTION_ADDRESS } from '@/lib/constants';

type SubmitStatus = 'idle' | 'uploading' | 'hashing' | 'minting' | 'success' | 'error';

export default function SubmitPaperForm() {
  const { publicKey } = useWallet();
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string>('');
  const [nftAddress, setNftAddress] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    description: '',
    tags: '',
    doi: '',
    license: 'CC-BY-4.0',
    version: '1.0.0',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF file');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !file) return;

    setError('');
    setStatus('uploading');

    try {
      // 1. Upload file to Arweave
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const { uri, hash } = await uploadResponse.json();
      
      // 2. Mint NFT
      setStatus('minting');
      
      const mintResponse = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          authors: formData.authors,
          description: formData.description,
          tags: formData.tags,
          doi: formData.doi,
          license: formData.license,
          version: formData.version,
          uri,
          hash,
          collection: COLLECTION_ADDRESS.toString(),
          wallet: publicKey.toString(),
        }),
      });

      if (!mintResponse.ok) {
        throw new Error('Failed to mint NFT');
      }

      const { mint } = await mintResponse.json();
      setNftAddress(mint);
      setStatus('success');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  };

  const isLoading = ['uploading', 'hashing', 'minting'].includes(status);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Submit Your Research Paper</CardTitle>
          <CardDescription>
            Mint your research as an NFT on Solana. Your work will be permanently stored on Arweave with verifiable authenticity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Research Paper (PDF)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                {file && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {file.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter paper title"
                required
                disabled={isLoading}
              />
            </div>

            {/* Authors */}
            <div className="space-y-2">
              <Label htmlFor="authors">Authors *</Label>
              <Input
                id="authors"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                placeholder="Alice Silva, Bob Santos (comma-separated)"
                required
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Abstract</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter paper abstract..."
                disabled={isLoading}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="machine learning, medical imaging (comma-separated)"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* DOI */}
              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input
                  id="doi"
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  placeholder="10.1234/example"
                  disabled={isLoading}
                />
              </div>

              {/* License */}
              <div className="space-y-2">
                <Label htmlFor="license">License</Label>
                <Input
                  id="license"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  placeholder="CC-BY-4.0"
                  disabled={isLoading}
                />
              </div>

              {/* Version */}
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Status Messages */}
            {status === 'uploading' && (
              <div className="flex items-center gap-2 text-brand-violet">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading to Arweave...</span>
              </div>
            )}
            
            {status === 'minting' && (
              <div className="flex items-center gap-2 text-brand-violet">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Minting NFT on Solana...</span>
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      Paper Minted Successfully!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      NFT Address: <code className="bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">{nftAddress}</code>
                    </p>
                    <a 
                      href={`https://explorer.solana.com/address/${nftAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2 inline-block"
                    >
                      View on Solana Explorer →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100">Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !file || !publicKey}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Mint as NFT
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

