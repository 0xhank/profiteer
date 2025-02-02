export interface Token {
    mint: string;
    createdAt: string;
    priceUsd?: number;

    metadata: {
        name: string;
        symbol: string;
        imageUri: string;
        startSlot: number;
        supply: number;
        decimals: number;
    };
}
