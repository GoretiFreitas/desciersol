'use client';

import { BADGE_LEVELS } from '@/lib/review-types';
import { Badge } from '@/components/ui/badge';

interface BadgeDisplayProps {
  level: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function BadgeDisplay({ level, reviewCount, size = 'md', showDetails = true }: BadgeDisplayProps) {
  const badgeInfo = BADGE_LEVELS.find(b => b.level === level) || BADGE_LEVELS[0];

  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-lg px-4 py-2',
  };

  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    descier: 'bg-descier-2 text-white dark:bg-descier-3',
  };

  if (level === 0) {
    return null; // Don't show badge if not earned
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Badge
        className={`${sizeClasses[size]} ${colorClasses[badgeInfo.color] || colorClasses.descier} font-semibold border-0`}
      >
        <span className="mr-1">{badgeInfo.icon}</span>
        {badgeInfo.name}
      </Badge>
      {showDetails && reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">
          {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
