'use client';

import { useClientOnly } from '@/hooks/useClientOnly';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza children apenas no cliente
 * Evita erros de hidratação
 */
export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const isClient = useClientOnly();

  if (!isClient) {
    return fallback || <Skeleton className="h-4 w-full" />;
  }

  return <>{children}</>;
}
