import * as anchor from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair, keypairIdentity, Umi } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fromWeb3JsKeypair,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  Connection,
  LAMPORTS_PER_SOL,
  Keypair as Web3JsKeypair,
} from "@solana/web3.js";
import path from "path";
import {
  AMM,
  getSolAmountWithFee,
  getTknAmount,
  INIT_DEFAULTS,
  PumpScienceSDK,
  SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
} from "../src";
import { confirmTransaction, processTransaction } from "../src/confirmTx";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const privateKeyUrl = path.resolve(__dirname, "../../../pump_test.json");
const loadProviders = () => {
  const privateKey = Uint8Array.from(require(privateKeyUrl));
  // convert the private key to a string
  const privateKeyString = bs58.encode(privateKey);
  console.log({ privateKeyString });
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
  // const programId = toWeb3JsPublicKey(PUMP_SCIENCE_PROGRAM_ID);
  // const program = anchor.workspace.Pump as Program<PumpScience>;
  console.log(anchor.workspace);

  //  async function listenToCreateEvent() {
  //      // Subscribe to the program's logs

  //      connection.onLogs(programId, (logs, context) => {
  //          console.log('New logs:', logs);
  //          // Parse the logs to find your specific event
  //          logs.logs.forEach(log => {
  //              if (log.includes('CreateEvent')) {
  //                  console.log('CreateEvent detected:', log);
  //                  // Further parse the log to extract event data
  //              }
  //          });
  //      });
  //  }
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

    // listenToCreateEvent();
  });

  describe("initialize", () => {
    it("is initialized", async () => {
      const adminSdk = sdk.getAdminSDK();

      let global;
      try {
        global = await adminSdk.PumpScience.fetchGlobalData();
      } catch (error) {
        const txBuilder = adminSdk.initialize(INIT_DEFAULTS);
        await processTransaction(umi, txBuilder);

        global = await adminSdk.PumpScience.fetchGlobalData();
        expect(global).toBeDefined();
        expect(global.initialVirtualSolReserves.toString()).toBe(
          INIT_DEFAULTS.initialVirtualSolReserves.toString()
        );
        expect(global.initialVirtualTokenReserves.toString()).toBe(
          INIT_DEFAULTS.initialVirtualTokenReserves.toString()
        );
        expect(global.initialRealTokenReserves.toString()).toBe(
          INIT_DEFAULTS.initialRealTokenReserves.toString()
        );
        expect(global.tokenTotalSupply.toString()).toBe(
          INIT_DEFAULTS.tokenTotalSupply.toString()
        );
        expect(global.mintDecimals).toBe(INIT_DEFAULTS.mintDecimals);
        expect(global.migrateFeeAmount.toString()).toBe(
          INIT_DEFAULTS.migrateFeeAmount.toString()
        );
        expect(global.migrationTokenAllocation.toString()).toBe(
          INIT_DEFAULTS.migrationTokenAllocation.toString()
        );
        expect(global.feeReceiver).toBe(INIT_DEFAULTS.feeReceiver);
      }
    });
  });

  describe.skip("create pool", () => {
    const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
    it("creates a pool", async () => {
      const curveSdk = sdk.getCurveSDK(mintKp.publicKey);

      const txBuilder = curveSdk.createBondingCurve(
        SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
        mintKp,
        false
      );

      await processTransaction(umi, txBuilder);

      const poolData = await curveSdk.fetchData({
        commitment: "confirmed",
      });

      expect(poolData).toBeDefined();
      expect(Number(poolData.virtualSolReserves)).toBe(
        INIT_DEFAULTS.initialVirtualSolReserves
      );
      expect(Number(poolData.virtualTokenReserves)).toBe(
        INIT_DEFAULTS.initialVirtualTokenReserves
      );
      expect(Number(poolData.realSolReserves)).toBe(0);
      expect(Number(poolData.realTokenReserves)).toBe(
        INIT_DEFAULTS.initialRealTokenReserves
      );
      expect(Number(poolData.tokenTotalSupply)).toBe(
        INIT_DEFAULTS.tokenTotalSupply
      );
      expect(poolData.startSlot).toBeDefined();
      expect(poolData.complete).toBe(false);
    });
  });

  it("swap: buy", async () => {
    const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
    console.log("mintKp", mintKp.publicKey.toString());
    const curveSdk = sdk.getCurveSDK(mintKp.publicKey);
    const curveTxBuilder = curveSdk.createBondingCurve(
      SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
      mintKp,
      false
    );
    // Initialize feeReceiver's Solana ATA

    await processTransaction(umi, curveTxBuilder);

    const bondingCurveData = await curveSdk.fetchData({
      commitment: "confirmed",
    });

    const feeReceiver = INIT_DEFAULTS.feeReceiver;
    const feeReceiverAta = (
      await getOrCreateAssociatedTokenAccount(
        connection,
        web3jsKp,
        toWeb3JsPublicKey(mintKp.publicKey),
        toWeb3JsPublicKey(feeReceiver),
        false,
        "confirmed"
      )
    ).address;

    console.log("Initialized feeReceiver ATA:", feeReceiverAta.toString());

    const amm = AMM.fromBondingCurve(bondingCurveData);

    const minBuyTokenAmount = 100_000_000_000n;

    const solAmount = amm.getSolForSellTokens(minBuyTokenAmount);

    const currentSlot = await connection.getSlot();
    const startSlot = (
      await curveSdk.fetchData({
        commitment: "confirmed",
      })
    ).startSlot;
    // should use actual fee set on global when live

    const {feeBps, solAmountWithFee} = getSolAmountWithFee(solAmount, currentSlot, Number(startSlot))
    let buyResult = amm.applyBuy(minBuyTokenAmount);
    console.log({feeBps, solAmount, solAmountWithFee, buyResult})

    const txBuilder = curveSdk.swap({
      direction: "buy",
      exactInAmount: solAmountWithFee,
      minOutAmount: minBuyTokenAmount *  975n / 1000n ,
    });

    const txRes = await processTransaction(umi, txBuilder);
    const signatureBs58 = bs58.encode(txRes.signature);
    const log = await connection.getTransaction(signatureBs58, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    console.log(log?.meta?.logMessages);

    await confirmTransaction(connection, signatureBs58);

    const userTokenAccount = curveSdk.getUserTokenAccount(mintKp.publicKey)[0];

    const bondingCurveDataPost = await curveSdk.fetchData({
      commitment: "confirmed",
    });
    try {
      const traderAtaBalancePost = await getTknAmount(
        umi,
        userTokenAccount,
        "confirmed"
      );
      expect(traderAtaBalancePost).toBeGreaterThanOrEqual(minBuyTokenAmount);
    } catch (error) {
      console.log("error fetching trader ata balance", error);
    }

    console.log("pre.realTokenReserves", bondingCurveData.realTokenReserves);
    console.log(
      "post.realTokenReserves",
      bondingCurveDataPost.realTokenReserves
    );
    console.log("buyTokenAmount", minBuyTokenAmount);
    const tknAmountDiff = BigInt(
      bondingCurveData.realTokenReserves -
        bondingCurveDataPost.realTokenReserves
    );
    console.log("real difference", tknAmountDiff);
    console.log(
      "buyAmount-tknAmountDiff",
      tknAmountDiff - minBuyTokenAmount,
      tknAmountDiff > minBuyTokenAmount
    );
  });
});
