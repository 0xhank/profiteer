import { MessageV0, PublicKey } from "@solana/web3.js";

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
