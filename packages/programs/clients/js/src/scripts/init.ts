import { INIT_DEFAULTS } from "../../src/constants";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../src/idls/pump_science.json";
import { processTransaction } from "../../src/confirmTx";
import { PumpScienceSDK } from "../sdk/pump-science";
import dotenv from "dotenv";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Program } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { PUMP_SCIENCE_PROGRAM_ID } from "../../src/generated";
import { PumpScience } from "../../src/idls/pump_science";
import { Keypair as Web3JsKeypair } from "@solana/web3.js";
import path from "path";
import { keypairIdentity } from "@metaplex-foundation/umi";


const privateKeyUrl = path.resolve(
  __dirname,
  "../../../../pump_test.json"
);

const loadProviders = () => {
  // convert the private key to a string

  const rpcUrl = "https://cosmological-wild-dew.solana-devnet.quiknode.pro/5c3ba882408038ec82100344e3c50147ace8fd51"
    console.log({rpcUrl, privateKeyUrl});
    if (!rpcUrl) {
        throw new Error("RPC_URL is not set");
    }
    if (!privateKeyUrl) {
        throw new Error("PRIVATE_KEY_URL is not set");
    }
  const web3jsKp = Web3JsKeypair.fromSecretKey(
    Uint8Array.from(require(privateKeyUrl))
  );
  const connection = new Connection(rpcUrl, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new Wallet(web3jsKp),
    anchor.AnchorProvider.defaultOptions()
  );

  const programId = toWeb3JsPublicKey(PUMP_SCIENCE_PROGRAM_ID);
  const program = new Program(
    idl as anchor.Idl as PumpScience,
    programId,
    provider
  );
  const masterKp = fromWeb3JsKeypair(web3jsKp);

  const umi = createUmi(rpcUrl);
  return {
    umi,
    connection,
    rpcUrl,
    masterKp,
    program,
    programId,
    provider,
    web3jsKp,
  };
};
export const initProtocol = async () => {
    const { rpcUrl, masterKp, provider } = loadProviders();
    const umi = createUmi(rpcUrl).use(keypairIdentity(masterKp));
    const sdk = new PumpScienceSDK(provider, masterKp);

      const adminSdk = sdk.getAdminSDK();

      let global;
      try {
        global = await adminSdk.PumpScience.fetchGlobalData();
        console.log("global already initialized");
        console.log(global);
      } catch (error) {
        const txBuilder = adminSdk.initialize(INIT_DEFAULTS);
        await processTransaction(umi, txBuilder);
        console.log("initialized");

        global = await adminSdk.PumpScience.fetchGlobalData();
        console.log("global", global);
    }
}

initProtocol();