import env from "@bin/env";
import * as anchor from "@coral-xyz/anchor";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import {
  Keypair as Web3JsKeypair,
} from "@solana/web3.js";
import { PumpScienceSDK } from "programs/clients/js/src";

export const initProviders = () => {
  const pKey = Uint8Array.from(require(env.PAYER_PRIVATE_KEY));
  const web3jsKp = Web3JsKeypair.fromSecretKey(pKey);
  const masterKp = fromWeb3JsKeypair(web3jsKp);

  const rpcUrl = env.RPC_URL;
  process.env.ANCHOR_PROVIDER_URL = rpcUrl;

  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);
  const umi = createUmi(rpcUrl);
  const sdk = new PumpScienceSDK(umi);

  return { umi, connection, provider, rpcUrl, masterKp, sdk };
};