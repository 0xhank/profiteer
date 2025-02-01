import { Token } from "shared/src/types/token";
import { Database } from "../../../../database.types";

export type DbToken = Database["public"]["Tables"]["token_metadata"]["Row"];

export const formatToken = (token: DbToken): Token => {
    return {
        mint: token.mint,
        createdAt: token.created_at,
        priceUsd: 0,
        metadata: {
                name: token.name,
                symbol: token.symbol,
                imageUri: token.uri,
                startSlot: token.start_slot,
                // times 1000 to get back to the original decimals divided by 1e9
                supply: token.supply / 1e5,
            },
        };
    };