import { RealtimeChannel } from '@supabase/supabase-js';
import { createContext, useState, useEffect } from 'react';
import supabase from '../sbClient';

interface SolanaPriceContextType {
  priceUSD: number;
  isReady: boolean;
  error: string | null;
}

export const SolPriceContext = createContext<SolanaPriceContextType>({
  priceUSD: 0, // Default fallback value
  isReady: false,
  error: null,
});

export const SolPriceProvider = ({ children }: { children: React.ReactNode }) => {
  const [priceUSD, setPriceUSD] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen to inserts
  const handleInserts = (payload: { new: { price_usd: number } }) => {
    setPriceUSD(payload.new.price_usd);
    if (!isReady) {
      setIsReady(true);
    }
  }

  useEffect(() => {
    let sub: RealtimeChannel | null = null;
    try {
      console.log('Subscribing to sol_price_usd', supabase);
    sub = supabase
      .channel('sol_price_usd')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sol_price_usd' }, handleInserts)
      .subscribe()
    } catch (error) {
      console.error('Error subscribing to sol_price_usd', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
    return () => {
      if (sub) {
        supabase.removeChannel(sub);
      }
    }
  }, []);

  return (
    <SolPriceContext.Provider value={{ priceUSD, isReady, error }}>
      {children}
    </SolPriceContext.Provider>
  );
};

