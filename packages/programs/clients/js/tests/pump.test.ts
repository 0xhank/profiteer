import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair, keypairIdentity, Umi } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fromWeb3JsKeypair,
  toWeb3JsKeypair,
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
  const rpcUrl = "https://cosmological-wild-dew.solana-devnet.quiknode.pro/5c3ba882408038ec82100344e3c50147ace8fd51/";
  // const rpcUrl = "http://localhost:8899";

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
    idl as unknown as anchor.Idl,
    programId,
    provider
  ) as unknown as Program<PumpScience>;
  const masterKp = fromWeb3JsKeypair(web3jsKp);
  console.log("masterKp", masterKp.publicKey);

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
  let connection: Connection;
  let program: Program<PumpScience>;

  beforeAll(async () => {
    const {
      masterKp: preMasterKp,
      umi: preumi,
      connection: preConnection,
      program: preProgram,
      rpcUrl,
      provider,
    } = loadProviders();

    masterKp = preMasterKp;
    connection = preConnection;
    program = preProgram;
    umi = preumi.use(keypairIdentity(masterKp));
    sdk = new PumpScienceSDK(provider,masterKp);
    if (rpcUrl.includes("localhost")) {
      const tx = await preConnection.requestAirdrop(
        toWeb3JsPublicKey(masterKp.publicKey),
        100 * LAMPORTS_PER_SOL
      );
      await confirmTransaction(preConnection, tx);
      console.log("Airdropped SOL to master keypair");
    }


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

  let mintKp: Keypair;
  describe("create pool", () => {
    beforeAll(async () => {
      mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
    });
    it("creates a pool", async () => {
      const curveSdk = sdk.getCurveSDK(mintKp.publicKey);


      const tx = await curveSdk.createBondingCurve(
        SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
        mintKp,
        masterKp.publicKey,
        false
      );

      tx.sign([toWeb3JsKeypair(masterKp)]);

      const txid = await connection.sendTransaction(tx);
      await confirmTransaction(connection, txid);
      const poolData = await curveSdk.fetchData({
        commitment: "confirmed",
      });

      const events = await getTxEventsFromTxBuilderResponse(connection, program, txid);
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
    const curveTxBuilder = await curveSdk.createBondingCurve(
      SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
      mintKp,
      masterKp.publicKey,
      false
    );
    // Initialize feeReceiver's Solana ATA

    const createTx = await connection.sendTransaction(curveTxBuilder);
    await confirmTransaction(connection, createTx);

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

    const { solAmountWithFee } = getSolAmountWithFee(
      solAmount,
      currentSlot,
      Number(startSlot)
    );

    const tx = curveSdk.swap({
      direction: "buy",
      user: masterKp.publicKey,
      exactInAmount: solAmountWithFee,
      minOutAmount: (minBuyTokenAmount * 975n) / 1000n,
    });


    const txRes = await connection.sendTransaction(tx);
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
