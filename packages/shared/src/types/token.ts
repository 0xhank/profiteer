export interface Token {
    mint: string;
    createdAt: string;
    priceUsd?: number;
    priceHistory?: number[];
    complete?: boolean;
    volume12h?: number;

    metadata: {
        name: string;
        symbol: string;
        imageUri: string;
        startSlot: number;
        supply: number;
        decimals: number;
    };
}
