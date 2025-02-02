import { MessageV0 } from "@solana/web3.js";
import { z } from "zod";

export const createBondingCurveInputSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  uri: z.string(),
});

export type CreateBondingCurveInput = z.infer<typeof createBondingCurveInputSchema>;

export const swapInputSchema = z.object({
  mint: z.string(),
  amount: z.string(),
  minAmountOut: z.string(),
  direction: z.enum(["buy", "sell"]),
});
export type SwapInput = z.infer<typeof swapInputSchema>;

export type TransactionRegistryData = {
  timestamp: number;
  autoSlippage: boolean;
  contextSlot: number;
  buildAttempts: number;
};

export type TransactionRegistryEntry = {
  message: MessageV0;
  lastValidBlockHeight: number;
} & TransactionRegistryData;

export type ResponseType = "success" | "fail" | "rebuild";


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
