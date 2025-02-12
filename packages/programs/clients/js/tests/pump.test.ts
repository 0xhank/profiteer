import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
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
import { PumpScience } from "src/idls/pump_science";
import {
  AMM,
  getSolAmountWithFee,
  getTknAmount,
  INIT_DEFAULTS,
  PUMP_SCIENCE_PROGRAM_ID,
  PumpScienceSDK,
  SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
} from "../src";
import { confirmTransaction, processTransaction } from "../src/confirmTx";
import idl from "../src/idls/pump_science.json";


const loadProviders = () => {
  // convert the private key to a string
  // const rpcUrl = "https://cosmological-wild-dew.solana-devnet.quiknode.pro/5c3ba882408038ec82100344e3c50147ace8fd51/";
  // const rpcUrl = "https://api.devnet.solana.com	"
  // const rpcUrl = "http://localhost:8899";

  // mainnet
  const rpcUrl = "https://winter-wandering-frost.solana-mainnet.quiknode.pro/ccd37eee5fa0749b20281e12a7f31885b95f93c2"

  // const privateKey = require(privateKeyUrl);
  // console.log("privateKey", privateKey);
  const web3jsKp = Web3JsKeypair.fromSecretKey(
    Uint8Array.from([115,188,144,34,211,204,50,142,66,45,142,12,169,155,140,73,241,105,28,157,189,15,228,23,80,138,229,102,85,12,194,45,212,87,109,48,35,20,17,60,72,173,42,99,3,0,144,232,7,114,158,115,246,115,61,117,58,212,252,4,16,170,37,88])
  );
  const connection = new Connection(rpcUrl, "confirmed");
  const provider = new anchor.AnchorProvider(
    connection,
    new Wallet(web3jsKp),
    anchor.AnchorProvider.defaultOptions()
  );

  console.log("PUMP_SCIENCE_PROGRAM_ID", PUMP_SCIENCE_PROGRAM_ID);
  const programId = toWeb3JsPublicKey(PUMP_SCIENCE_PROGRAM_ID);
  const program = new Program(
    idl as unknown as anchor.Idl,
    programId,
    provider
  ) as unknown as Program<PumpScience>;
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
  let connection: Connection;

  beforeAll(async () => {
    const {
      masterKp: preMasterKp,
      umi: preumi,
      connection: preConnection,
      rpcUrl,
      provider,
    } = loadProviders();

    masterKp = preMasterKp;
    connection = preConnection;
    umi = preumi.use(keypairIdentity(masterKp));
    sdk = new PumpScienceSDK(provider,masterKp);
    if (rpcUrl.includes("localhost")) {
      const tx = await preConnection.requestAirdrop(
        toWeb3JsPublicKey(masterKp.publicKey),
        100 * LAMPORTS_PER_SOL
      );
      await confirmTransaction(preConnection, tx);
    }


  });

  describe("initialize", () => {
    it("is initialized", async () => {
      const adminSdk = sdk.getAdminSDK();

      let global;
      try {
        global = await adminSdk.PumpScience.fetchGlobalData();
      } catch (error) {
        const txBuilder = adminSdk.initialize(INIT_DEFAULTS);
        const tx = await processTransaction(umi, txBuilder);
        await confirmTransaction(connection, tx.signatureBs58);

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
  describe.skip("create pool", () => {
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
    const curveTx = await curveSdk.createBondingCurve(
      SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
      mintKp,
      masterKp.publicKey,
      false
    );
    curveTx.sign([toWeb3JsKeypair(masterKp)]);
    // Initialize feeReceiver's Solana ATA


    const createTx = await connection.sendTransaction(curveTx);
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

    const tx = await curveSdk.swap({
      direction: "buy",
      user: masterKp.publicKey,
      exactInAmount: solAmountWithFee,
      minOutAmount: (minBuyTokenAmount * 975n) / 1000n,
    });
    tx.sign([toWeb3JsKeypair(masterKp)]);


    const sig = await connection.sendTransaction(tx, { preflightCommitment: "confirmed" });

    await confirmTransaction(connection, sig);

    const userTokenAccount = curveSdk.getUserTokenAccount(mintKp.publicKey)[0];

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
  });

  it.skip("migrate", async () => {
      const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
    const curveSdk = sdk.getCurveSDK(mintKp.publicKey);
    const curveTx = await curveSdk.createBondingCurve(
      SIMPLE_DEFAULT_BONDING_CURVE_PRESET,
      mintKp,
      masterKp.publicKey,
      false
    );
    curveTx.sign([toWeb3JsKeypair(masterKp)]);
    // Initialize feeReceiver's Solana ATA


    const createTx = await connection.sendTransaction(curveTx);
    await confirmTransaction(connection, createTx);

    const bondingCurveData = await curveSdk.fetchData({
      commitment: "confirmed",
    });

    const amm = AMM.fromBondingCurve(bondingCurveData);

    const minBuyTokenAmount = 793_100_000_000_000n;

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
    const airdropTx = await connection.requestAirdrop(toWeb3JsPublicKey(masterKp.publicKey), Number(solAmountWithFee * 10n));
    await confirmTransaction(connection, airdropTx);
    console.log("Airdropped SOL to master keypair");
    const balance = await connection.getBalance(toWeb3JsPublicKey(masterKp.publicKey), "confirmed");
    console.log({balance, solAmount, solAmountWithFee});

    const tx = await curveSdk.swap({
      direction: "buy",
      user: masterKp.publicKey,
      exactInAmount: solAmountWithFee * 10n,
      minOutAmount: 0,
    });
    tx.sign([toWeb3JsKeypair(masterKp)]);
    const sig = await connection.sendTransaction(tx, { preflightCommitment: "confirmed" });

    await confirmTransaction(connection, sig);

    const bondingCurveDataPost = await curveSdk.fetchData({
      commitment: "confirmed",
    });
    
    expect(bondingCurveDataPost.complete).toBe(true);

    const migrateTx = await curveSdk.migrate(masterKp);

    const preMigrateSig = await connection.sendTransaction(migrateTx.preTx, { preflightCommitment: "confirmed" });
    await confirmTransaction(connection, preMigrateSig);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const migrateSig = await connection.sendTransaction(migrateTx.tx, { preflightCommitment: "confirmed" });
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature:migrateSig, blockhash, lastValidBlockHeight}, "confirmed" );
    const txData = await connection.getTransaction(migrateSig, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed"
    });

    console.log("txData", txData);

    const bondingCurveDataPostMigrated = await curveSdk.fetchData({
      commitment: "confirmed",
    });
    console.log("bondingCurveDataPostMigrated", bondingCurveDataPostMigrated);
  }, 20000)
});

