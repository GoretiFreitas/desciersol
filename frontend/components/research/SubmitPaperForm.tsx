'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { COLLECTION_ADDRESS } from '@/lib/constants';

type SubmitStatus = 'idle' | 'uploading' | 'hashing' | 'minting' | 'success' | 'error';

export default function SubmitPaperForm() {
  const { publicKey } = useWallet();
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string>('');
  const [nftAddress, setNftAddress] = useState<string>('');
  
  // Arquivos
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [nftImage, setNftImage] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    description: '',
    tags: '',
    doi: '',
    license: 'CC-BY-4.0',
    version: '1.0.0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !pdfFile) {
      setError('Por favor conecte sua carteira e selecione um arquivo PDF');
      return;
    }

    setError('');
    setStatus('uploading');

    try {
      // 1. Upload arquivos para Arweave
      const uploadFormData = new FormData();
      uploadFormData.append('pdf', pdfFile);
      
      if (coverImage) {
        uploadFormData.append('coverImage', coverImage);
      }
      
      if (nftImage) {
        uploadFormData.append('nftImage', nftImage);
      }
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Falha no upload');
      }

      const { pdfUri, pdfHash, coverImageUri, nftImageUri } = await uploadResponse.json();
      
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
          pdfUri,
          pdfHash,
          coverImageUri,
          nftImageUri,
          collection: COLLECTION_ADDRESS.toString(),
          wallet: publicKey.toString(),
        }),
      });

      if (!mintResponse.ok) {
        const errorData = await mintResponse.json();
        throw new Error(errorData.error || 'Falha ao mintar NFT');
      }

      const { mint } = await mintResponse.json();
      setNftAddress(mint);
      setStatus('success');
    } catch (err) {
      console.error('Erro no submit:', err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
      setStatus('error');
    }
  };

  const isLoading = ['uploading', 'hashing', 'minting'].includes(status);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl text-slate-900 dark:text-white">Submit Your Research Paper</CardTitle>
          <CardDescription className="text-slate-700 dark:text-slate-200">
            Mint your research as an NFT on Solana. Your work will be permanently stored on Arweave with verifiable authenticity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PDF Upload */}
            <FileUpload
              label="Paper de Pesquisa (PDF) *"
              description="Faça upload do seu paper em formato PDF"
              accept=".pdf,application/pdf"
              maxSize={50}
              onFileSelect={setPdfFile}
              value={pdfFile}
              disabled={isLoading}
              showPreview={false}
            />

            {/* Cover Image Upload */}
            <FileUpload
              label="Imagem de Capa"
              description="Imagem de capa para exibição do paper (recomendado: 1200x630px)"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              maxSize={10}
              onFileSelect={setCoverImage}
              value={coverImage}
              disabled={isLoading}
              showPreview={true}
            />

            {/* NFT Image Upload */}
            <FileUpload
              label="Imagem do NFT"
              description="Imagem que será exibida no NFT (recomendado: 512x512px)"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              maxSize={10}
              onFileSelect={setNftImage}
              value={nftImage}
              disabled={isLoading}
              showPreview={true}
            />

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
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fazendo upload para Arweave...</span>
              </div>
            )}
            
            {status === 'minting' && (
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mintando NFT na Solana...</span>
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      Paper Mintado com Sucesso!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Endereço do NFT: <code className="bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">{nftAddress}</code>
                    </p>
                    <a 
                      href={`https://explorer.solana.com/address/${nftAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2 inline-block"
                    >
                      Ver no Solana Explorer →
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
                    <h4 className="font-semibold text-red-900 dark:text-red-100">Erro</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !pdfFile || !publicKey}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Mintar como NFT
                </>
              )}
            </Button>
            
            {!publicKey && (
              <p className="text-sm text-center text-muted-foreground">
                Por favor, conecte sua carteira para continuar
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

