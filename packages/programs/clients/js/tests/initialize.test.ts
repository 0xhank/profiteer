import {
  Keypair,
  keypairIdentity,
  Umi,

} from "@metaplex-foundation/umi";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import {
  Connection,
  LAMPORTS_PER_SOL,
  Keypair as Web3JsKeypair,
} from "@solana/web3.js";
import path from "path";
import {
  INIT_DEFAULTS,
  PumpScienceSDK,
  SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
} from "../src";
import { confirmTransaction, processTransaction } from "../src/confirmTx";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

const privateKeyUrl = path.resolve(__dirname, "../../../pump_test.json");
const loadProviders = () => {
  const privateKey = Uint8Array.from(require(privateKeyUrl));
  // convert the private key to a string
  const privateKeyString = bs58.encode(privateKey);
  console.log({privateKeyString});
  const web3jsKp = Web3JsKeypair.fromSecretKey(privateKey);
  const masterKp = fromWeb3JsKeypair(web3jsKp);

  let rpcUrl = "http://127.0.0.1:8899";

  const connection = new Connection(rpcUrl, "confirmed");
  const umi = createUmi(rpcUrl);
  return { umi, connection, rpcUrl, masterKp };
};
// const amman = Amman.instance({
//   ammanClientOpts: { autoUnref: false, ack: true },
//   knownLabels: {
//     [PUMP_SCIENCE_PROGRAM_ID.toString()]: "PumpScienceProgram",
//   },
// });

// pdas and util accs

// const labelKeypairs = async ({umi, masterKp, simpleMintKp, creator, trader, withdrawAuthority}: {umi: Umi, masterKp: Keypair, simpleMintKp: Keypair, creator: Keypair, trader: Keypair, withdrawAuthority: Keypair}) => {
//   amman.addr.addLabel("master", masterKp.publicKey);
//   amman.addr.addLabel("simpleMint", simpleMintKp.publicKey);
//   amman.addr.addLabel("creator", creator.publicKey);
//   amman.addr.addLabel("trader", trader.publicKey);
//   amman.addr.addLabel("withdrawAuthority", withdrawAuthority.publicKey);

//   const curveSdk = new PumpScienceSDK(
//     // master signer
//     umi.use(keypairIdentity(masterKp))
//   ).getCurveSDK(simpleMintKp.publicKey);

//   amman.addr.addLabel("global", curveSdk.PumpScience.globalPda[0]);
//   amman.addr.addLabel("eventAuthority", curveSdk.PumpScience.evtAuthPda[0]);
//   amman.addr.addLabel("simpleMintBondingCurve", curveSdk.bondingCurvePda[0]);
//   amman.addr.addLabel(
//     "simpleMintBondingCurveTknAcc",
//     curveSdk.bondingCurveTokenAccount[0]
//   );
//   amman.addr.addLabel("metadata", curveSdk.mintMetaPda[0]);

//   // amman.addr.addLabel("creatorVault", curveSdk.creatorVaultPda[0]);
//   // amman.addr.addLabel(
//   //   "creatorVaultTknAcc",
//   //   curveSdk.creatorVaultTokenAccount[0]
//   // );

//   // amman.addr.addLabel("presaleVault", curveSdk.presaleVaultPda[0]);
//   // amman.addr.addLabel(
//   //   "presaleVaultTknAcc",
//   //   curveSdk.presaleVaultTokenAccount[0]
//   // );

//   // amman.addr.addLabel("brandVault", curveSdk.brandVaultPda[0]);
//   // amman.addr.addLabel("brandVaultTknAcc", curveSdk.brandVaultTokenAccount[0]);

//   // amman.addr.addLabel("platformVault", curveSdk.platformVaultPda[0]);
//   // amman.addr.addLabel(
//   //   "platformVaultTknAcc",
//   //   curveSdk.platformVaultTokenAccount[0]
//   // );
// };

describe("pump tests", () => {
  let umi: Umi;
  let sdk: PumpScienceSDK;
  let masterKp: Keypair;
  let web3jsKp: Web3JsKeypair;
  let connection: Connection;

  beforeAll(async () => {
    web3jsKp = Web3JsKeypair.fromSecretKey(
      Uint8Array.from(require(privateKeyUrl))
    );
    masterKp = fromWeb3JsKeypair(web3jsKp);
    const { umi: preumi, connection: preConnection } = loadProviders();
    connection = preConnection;
    umi = preumi.use(keypairIdentity(masterKp));
    sdk = new PumpScienceSDK(umi);
    const tx = await preConnection.requestAirdrop(
      web3jsKp.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await confirmTransaction(preConnection, tx);
    console.log("Airdropped SOL to master keypair");
  });

  describe("initialize", () => {
    it("is initialized", async () => {
      const adminBalance = await connection.getBalance(
        web3jsKp.publicKey,
        "confirmed"
      );
      console.log({ adminBalance });
      const adminSdk = sdk.getAdminSDK();

      let global;
      try {
        global = await adminSdk.PumpScience.fetchGlobalData();
        console.log("Contract already initialized:", global);
      } catch (error) {
        console.log(
          "Contract not initialized, proceeding with initialization."
        );
        const txBuilder = adminSdk.initialize(INIT_DEFAULTS);
        await processTransaction(umi, txBuilder);

        global = await adminSdk.PumpScience.fetchGlobalData();
      }
    });
  });

  describe("create_pool", () => {
    it("creates a pool", async () => {
      const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
      const curveSdk = sdk.getCurveSDK(mintKp.publicKey);
  
      const txBuilder = curveSdk.createBondingCurve(
        SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
        mintKp,
        false
      );

      await processTransaction(umi, txBuilder);
    });
  });
});
