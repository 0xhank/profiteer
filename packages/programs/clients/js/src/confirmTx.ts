import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { TransactionBuilder, Umi } from "@metaplex-foundation/umi";
import {
  Connection,
  RpcResponseAndContext,
  SignatureStatus,
  TransactionConfirmationStatus,
} from "@solana/web3.js";

export async function processTransaction(umi: Umi, txBuilder: TransactionBuilder) {
  const tx = await txBuilder.sendAndConfirm(umi, {
    confirm: {
      commitment: "confirmed",
    },
  });
  const signatureBs58 = bs58.encode(tx.signature);
  return { ...tx, signatureBs58 };
}

export async function confirmTransaction(
  connection: Connection,
  txid: string
): Promise<RpcResponseAndContext<SignatureStatus>> {
  let attempt = 0;

  for (let i = 0; i < 30; i++) {
    try {
      const status = await connection.getSignatureStatus(txid, {
        searchTransactionHistory: true,
      });

      const acceptedStates: TransactionConfirmationStatus[] = [
        "confirmed",
        "finalized",
      ]; // processed is not accepted, 5% orphan chance

      if (
        status.value?.confirmationStatus &&
        acceptedStates.includes(status.value.confirmationStatus)
      ) {
        return status as RpcResponseAndContext<SignatureStatus>;
      }

      if (status.value?.err) {
        console.error(
          "[confirmTransaction] Error getting transaction confirmation:",
          status.value.err
        );
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error);
    }
    attempt++;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error("Transaction expired");
}
