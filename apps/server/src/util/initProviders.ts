import env from "@bin/env";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Connection, Keypair } from "@solana/web3.js";
import { PumpScienceSDK } from "programs";

export const initProviders = () => {
  const feePayerKeypair = Keypair.fromSecretKey(bs58.decode(env.PAYER_PRIVATE_KEY));
  const masterKp = fromWeb3JsKeypair(feePayerKeypair);

  const rpcUrl = env.RPC_URL;

  const connection = new Connection(rpcUrl, "confirmed");
  const umi = createUmi(rpcUrl).use(keypairIdentity(masterKp));
  const sdk = new PumpScienceSDK(umi);

  return { umi, connection, rpcUrl, masterKp, sdk };
};