export const useTokensForBuySol = (solAmount: bigint) => {
        if (solAmount === 0n) throw new Error("Cannot trade 0 tokens");

        // Convert to common decimal basis (using 9 decimals as base)
        const currentSol = this.virtualSolReserves;
        const currentTokens = (this.virtualTokenReserves * 1_000_000_000n) / 1_000_000n; // Scale to 9 decimals

        // Calculate new reserves using constant product formula
        const newSol = currentSol + solAmount;
        const newTokens = (currentSol * currentTokens) / newSol;
        const tokensOut = currentTokens - newTokens;

        // Convert back to 6 decimal places for tokens
        return (tokensOut * 1_000_000n) / 1_000_000_000n;
};
