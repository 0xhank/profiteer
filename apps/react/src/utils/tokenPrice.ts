export async function getTokenPrice(tokenAddress: string): Promise<{
  priceUsd: number | null;
  priceChange24h: number | null;
}> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      // Get the first pair (usually the most liquid one)
      const pair = data.pairs[0];
      return {
        priceUsd: parseFloat(pair.priceUsd) || null,
        priceChange24h: parseFloat(pair.priceChange24h) || null
      };
    }
    
    return {
      priceUsd: null,
      priceChange24h: null
    };
  } catch (error) {
    console.error('Error fetching token price:', error);
    return {
      priceUsd: null,
      priceChange24h: null
    };
  }
} 