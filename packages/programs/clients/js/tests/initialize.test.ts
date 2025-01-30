import { Keypair, keypairIdentity, transactionBuilder, TransactionBuilder, Umi } from "@metaplex-foundation/umi";

import * as anchor from "@coral-xyz/anchor";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { LAMPORTS_PER_SOL, Keypair as Web3JsKeypair } from "@solana/web3.js";
import path from 'path';
import { INIT_DEFAULTS, PumpScienceSDK } from "../src";
import { confirmTransaction } from "../src/confirmTx";

const privateKeyUrl = path.resolve(__dirname, "../../../pump_test.json");
const loadProviders = () => {
    const privateKey = Uint8Array.from(require(privateKeyUrl))
       const web3jsKp = Web3JsKeypair.fromSecretKey(privateKey)
        const masterKp = fromWeb3JsKeypair(
            web3jsKp
        ); 
        // process.env.ANCHOR_WALLET  = privateKey
  process.env.ANCHOR_WALLET = privateKeyUrl;

  let rpcUrl = "http://127.0.0.1:8899";
  if (process.env.ANCHOR_PROVIDER_URL) {
    rpcUrl = process.env.ANCHOR_PROVIDER_URL;
  } else {
    process.env.ANCHOR_PROVIDER_URL = rpcUrl;
  }

  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);
  const umi = createUmi(rpcUrl);
  return {umi, connection, provider, rpcUrl, masterKp};
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

describe('initialize', () => {
    let umi: Umi;
    let sdk : PumpScienceSDK;
    let masterKp: Keypair;

    async function processTransaction(txBuilder: TransactionBuilder) {
    let txWithBudget = transactionBuilder().add(
        setComputeUnitLimit(umi, { units: 600_000 })
    );
    const fullBuilder = txBuilder.prepend(txWithBudget);
    return await fullBuilder.sendAndConfirm(umi, {
        confirm: {
            commitment: "confirmed"
        }
    });
    }

    beforeAll(async () => {
        const web3jsKp = Web3JsKeypair.fromSecretKey(Uint8Array.from(require(privateKeyUrl)))
        masterKp = fromWeb3JsKeypair(
            web3jsKp
        );  
       const {umi: preumi, connection } = loadProviders();

        umi = preumi.use(keypairIdentity(masterKp));
        sdk = new PumpScienceSDK(umi);
        const tx = await connection.requestAirdrop(web3jsKp.publicKey, 100 * LAMPORTS_PER_SOL);
        await confirmTransaction(connection, tx);
        console.log("Airdropped SOL to master keypair");
        const adminBalance = await connection.getBalance(web3jsKp.publicKey, "confirmed");
        console.log(`Admin balance: ${adminBalance}`);
    });


    it("is initialized", async () => {
        const adminSdk = sdk.getAdminSDK();
        const txBuilder = adminSdk.initialize(INIT_DEFAULTS);

        await processTransaction(txBuilder);

        const global = await adminSdk.PumpScience.fetchGlobalData();
        console.log(global);
    });
        
});