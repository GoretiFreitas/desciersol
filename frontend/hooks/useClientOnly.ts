import { useState, useEffect } from 'react';

/**
 * Hook para evitar erros de hidratação
 * Retorna true apenas no cliente
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
