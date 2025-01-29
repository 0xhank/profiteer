import { createContext, useContext, useState, useEffect } from 'react';


interface SolanaPriceContextType {
  priceUSD: number;
  isLoading: boolean;
  error: string | null;
}

const SolanaPriceContext = createContext<SolanaPriceContextType>({
  priceUSD: 0, // Default fallback value
  isLoading: true,
  error: null,
});

export const SolanaPriceProvider = ({ children }: { children: React.ReactNode }) => {
  const [priceUSD, setPriceUSD] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolanaPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      setPriceUSD(data.solana.usd);
      setError(null);
    } catch (err) {
      console.error('Error fetching Solana price:', err);
      setError('Failed to fetch Solana price');
      // Keep the last known price if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolanaPrice();
    const intervalId = setInterval(fetchSolanaPrice, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SolanaPriceContext.Provider value={{ priceUSD, isLoading, error }}>
      {children}
    </SolanaPriceContext.Provider>
  );
};

export const useSolanaPrice = () => {
  const context = useContext(SolanaPriceContext);
  if (!context) {
    throw new Error('useSolanaPrice must be used within a SolanaPriceProvider');
  }
  return context;
}; 