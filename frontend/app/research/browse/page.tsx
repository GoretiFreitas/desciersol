'use client';

import { useEffect, useState } from 'react';
import PaperCard from '@/components/research/PaperCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, AlertCircle, FileText } from 'lucide-react';

interface NFT {
  address: string;
  name: string;
  uri: string;
  json?: {
    description?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
}

export default function BrowsePage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      
      // Buscar da collection E da wallet conhecida
      const responses = await Promise.all([
        fetch('/api/collection').catch(() => ({ ok: false, json: async () => ({ nfts: [] }) })),
        fetch('/api/nfts-by-owner?owner=5f4FHMha4CXEv3JQ4oi4aG19xdx2Wt2m2BpKwRbwWogd').catch(() => ({ ok: false, json: async () => ({ nfts: [] }) })),
      ]);

      const [collectionRes, ownerRes] = responses;
      
      const collectionData = collectionRes.ok ? await collectionRes.json() : { nfts: [] };
      const ownerData = ownerRes.ok ? await ownerRes.json() : { nfts: [] };

      // Combinar NFTs de ambas as fontes (sem duplicatas)
      const allNfts = [...(collectionData.nfts || []), ...(ownerData.nfts || [])];
      const uniqueNfts = allNfts.filter((nft, index, self) => 
        index === self.findIndex(n => n.address === nft.address)
      );

      console.log('📊 NFTs carregados:', {
        collection: collectionData.nfts?.length || 0,
        owner: ownerData.nfts?.length || 0,
        total: uniqueNfts.length
      });

      setNfts(uniqueNfts);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      nfts.flatMap((nft) =>
        (nft.json?.attributes || [])
          .filter((attr) => attr.trait_type === 'Tag')
          .map((attr) => attr.value)
      )
    )
  );

  // Filter NFTs
  const filteredNFTs = nfts.filter((nft) => {
    const matchesSearch =
      searchQuery === '' ||
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.json?.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      !selectedTag ||
      (nft.json?.attributes || []).some(
        (attr) => attr.trait_type === 'Tag' && attr.value === selectedTag
      );

    return matchesSearch && matchesTag;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            Browse Research Papers
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Explore decentralized research assets minted on Solana
          </p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search papers by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Filter by tag:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedTag === null ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(null)}
                    >
                      All
                    </Badge>
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTag === tag ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-brand-violet" />
            <p className="text-slate-600 dark:text-slate-300">Loading research papers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Error Loading Papers</h4>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredNFTs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="h-24 w-24 rounded-full bg-brand-lilac/20 flex items-center justify-center">
              <FileText className="h-12 w-12 text-brand-violet" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {searchQuery || selectedTag ? 'No papers found' : 'No papers yet'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                {searchQuery || selectedTag
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to submit a research paper!'}
              </p>
            </div>
          </div>
        )}

        {/* Papers Grid */}
        {!loading && !error && filteredNFTs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredNFTs.length} of {nfts.length} papers
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNFTs.map((nft) => {
                const attributes = nft.json?.attributes || [];
                const authors = attributes.find((a) => a.trait_type === 'Authors')?.value;
                const doi = attributes.find((a) => a.trait_type === 'DOI')?.value;
                const date = attributes.find((a) => a.trait_type === 'Publication Date')?.value;
                const tags = attributes
                  .filter((a) => a.trait_type === 'Tag')
                  .map((a) => a.value);

                return (
                  <PaperCard
                    key={nft.address}
                    address={nft.address}
                    name={nft.name}
                    description={nft.json?.description}
                    authors={authors}
                    doi={doi}
                    date={date}
                    tags={tags}
                    uri={nft.uri}
                    collection={nft.collection}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

