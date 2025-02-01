import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
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
import { PumpScience } from "src/idls/pump_science";
import {
  AMM,
  getSolAmountWithFee,
  getTknAmount,
  getTxEventsFromTxBuilderResponse,
  INIT_DEFAULTS,
  PUMP_SCIENCE_PROGRAM_ID,
  PumpScienceSDK,
  SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
} from "../src";
import { confirmTransaction, processTransaction } from "../src/confirmTx";
import idl from "../src/idls/pump_science.json";

const privateKeyUrl = path.resolve(__dirname, "../../../pump_test.json");
const loadProviders = () => {
  // convert the private key to a string
  const rpcUrl = "http://127.0.0.1:8899";
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

describe("pump tests", () => {
  let umi: Umi;
  let sdk: PumpScienceSDK;
  let masterKp: Keypair;
  let web3jsKp: Web3JsKeypair;
  let connection: Connection;
  let program: Program<PumpScience>;

  beforeAll(async () => {
    const {
      masterKp: preMasterKp,
      web3jsKp: preWeb3jsKp,
      umi: preumi,
      connection: preConnection,
      program: preProgram,
    } = loadProviders();

    masterKp = preMasterKp;
    web3jsKp = preWeb3jsKp;
    connection = preConnection;
    program = preProgram;
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
      const adminSdk = sdk.getAdminSDK();

      let global;
      try {
        global = await adminSdk.PumpScience.fetchGlobalData();
        console.log("global", global);
      } catch (error) {
        const txBuilder = adminSdk.initialize(INIT_DEFAULTS);
        await processTransaction(umi, txBuilder);
        console.log("initialized");

        global = await adminSdk.PumpScience.fetchGlobalData();
        console.log("global", global);
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

      const txRes = await processTransaction(umi, txBuilder);

      const poolData = await curveSdk.fetchData({
        commitment: "confirmed",
      });

      const events = await getTxEventsFromTxBuilderResponse(connection, program, txRes);
      console.log("events", events);

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

  it.skip("swap: buy", async () => {
    const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
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

    const { feeBps, solAmountWithFee } = getSolAmountWithFee(
      solAmount,
      currentSlot,
      Number(startSlot)
    );
    let buyResult = amm.applyBuy(minBuyTokenAmount);
    console.log({ feeBps, solAmount, solAmountWithFee, buyResult });

    const txBuilder = curveSdk.swap({
      direction: "buy",
      exactInAmount: solAmountWithFee,
      minOutAmount: (minBuyTokenAmount * 975n) / 1000n,
    });

    const txRes = await processTransaction(umi, txBuilder);
    const signatureBs58 = bs58.encode(txRes.signature);

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
