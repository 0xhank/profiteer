export interface Token {
    mint: string;

    priceUsd?: number;
    priceHistory?: number[];
    complete?: boolean;
    volume12h?: number;

    pastPrices?: {
        price1h: number;
        price1d: number;
        price30d: number;
    }

    metadata: {
        name: string;
        symbol: string;
        imageUri: string;
        startSlot: number;
        supply: number;
        decimals: number;
    };
}
