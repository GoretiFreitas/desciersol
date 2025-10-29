import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Calendar, Users, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PaperCardProps {
  address: string;
  name: string;
  description?: string;
  authors?: string;
  tags?: string[];
  doi?: string;
  date?: string;
  uri?: string;
}

export default function PaperCard({
  address,
  name,
  description,
  authors,
  tags = [],
  doi,
  date,
  uri,
}: PaperCardProps) {
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);

  useEffect(() => {
    // Fetch review stats for this paper
    fetch(`/api/review/${address}`)
      .then(res => res.json())
      .then(data => {
        setReviewCount(data.count || 0);
        setAvgRating(data.avgRating || 0);
      })
      .catch(() => {
        // Silently fail, não é crítico
      });
  }, [address]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Link href={`/research/paper/${address}`}>
              <CardTitle className="text-xl line-clamp-2 group-hover:text-brand-violet transition-colors cursor-pointer">
                {name}
              </CardTitle>
            </Link>
            {authors && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="line-clamp-1">{authors}</span>
              </div>
            )}
            {/* Review Stats */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-brand-violet to-brand-violet-2 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {description && (
          <CardDescription className="line-clamp-3">
            {description}
          </CardDescription>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border/40">
          {date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(date).toLocaleDateString()}</span>
            </div>
          )}
          {doi && (
            <div className="flex items-center gap-1">
              <span className="font-semibold">DOI:</span>
              <span>{doi}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/research/paper/${address}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              <FileText className="mr-2 h-3 w-3" />
              View Details
            </Button>
          </Link>
          <Link
            href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

