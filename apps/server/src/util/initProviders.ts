import env from "@bin/env";
import { Wallet } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair, toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { Connection, Keypair } from "@solana/web3.js";
import { PUMP_SCIENCE_PROGRAM_ID } from "programs";
import { PumpScienceSDK } from "programs";
import { PumpScience } from "programs/clients/js/src/idls/pump_science";
import * as anchor from "@coral-xyz/anchor";
import idl from "programs/clients/js/src/idls/pump_science.json";

export const initProviders = () => {
  const feePayerKeypair = Keypair.fromSecretKey(bs58.decode(env.PAYER_PRIVATE_KEY));
  const masterKp = fromWeb3JsKeypair(feePayerKeypair);

  const rpcUrl = env.RPC_URL;

  const connection = new Connection(rpcUrl, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new Wallet(feePayerKeypair),
    anchor.AnchorProvider.defaultOptions()
  );

  const programId = toWeb3JsPublicKey(PUMP_SCIENCE_PROGRAM_ID);
  const program = new Program(
    idl as anchor.Idl as PumpScience,
    programId,
    provider
  );
  const umi = createUmi(rpcUrl).use(keypairIdentity(masterKp));
  const sdk = new PumpScienceSDK(umi);

  return { umi, connection, rpcUrl, masterKp, sdk, program };
};