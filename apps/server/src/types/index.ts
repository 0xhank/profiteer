import { MessageV0, PublicKey } from "@solana/web3.js";
import { z } from "zod";

export const createBondingCurveInputSchema = z.object({
    userPublicKey: z.string(),
    name: z.string(),
    symbol: z.string(),
    uri: z.string(),
});

export type CreateBondingCurveInput = z.infer<
    typeof createBondingCurveInputSchema
>;

export const swapInputSchema = z.object({
    mint: z.string(),
    userPublicKey: z.string(),
    amount: z.string(),
    minAmountOut: z.string(),
    direction: z.enum(["buy", "sell"]),
    computeUnitPriceMicroLamports: z.number(),
    slippageBps: z.number().optional(),
});

export type SwapInput = z.infer<typeof swapInputSchema>;



// Internal swap types
export type JupiterSwapInput = SwapInput & {
  tokenAccount: PublicKey;
  solAccount: PublicKey;
  userKey: PublicKey;
};

export type SubmitSignedTransactionResponse = {
    responseType: ResponseType;
    txid?: string;
    timestamp?: number | null;
    error?: string;
};

// Transfer types
export interface TransferRequest {
    fromAddress: string;
    toAddress: string;
    amount: bigint;
    tokenId: string;
}

export interface SignedTransfer {
    transactionBase64: string;
    signatureBase64: string;
    signerBase58: string;
}

export type CurveCompleteEvent = {
    mint: string;
    virtualSolReserves: bigint;
    virtualTokenReserves: bigint;
    realSolReserves: bigint;
    realTokenReserves: bigint;
    timestamp: number;
    user: string;
};
