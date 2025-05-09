import {
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { none, publicKey } from "@metaplex-foundation/umi";
import { CreateBondingCurveInstructionArgs } from "./generated";

export const FEE_RECIPIENT = publicKey("G2MxbSK844rQSzEsNxN7adrBZdtbzyMx7wb5KntfiYhJ");
export const METEORA_CONFIG = publicKey("FiENCCbPi3rFh5pW2AJ59HC53yM32eLaCjMKxRqanKFJ");
export const VAULT_PROGRAM_ID = publicKey("24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi");
export const AMM_PROGRAM_ID = publicKey("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");

export const TOKEN_DECIMALS = 6; // 6 decimals
export const TOKEN_SUPPLY_AMOUNT = 1_000_000_000 * 10 ** TOKEN_DECIMALS;
export const tokenMetadataProgramId = publicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const SIMPLE_DEFAULT_BONDING_CURVE_PRESET: CreateBondingCurveInstructionArgs = {
    name: "simpleBondingCurve",
    symbol: "SBC",
    uri: "https://www.simpleBondingCurve.com",
    startSlot: none(),
}

export const INIT_DEFAULTS = {
    initialVirtualTokenReserves: 1_073_000_000_000_000,
    initialVirtualSolReserves: 30 * LAMPORTS_PER_SOL,
    initialRealTokenReserves: 793_100_000_000_000,
    tokenTotalSupply: 1_000_000_000_000_000,
    mintDecimals: TOKEN_DECIMALS,
    migrateFeeAmount: 500,
    migrationTokenAllocation: 50_000_000_000_000,
    feeReceiver: FEE_RECIPIENT,
    whitelistEnabled: false,
    meteoraConfig: METEORA_CONFIG
}

export const WL_SEED = "wl-seed"