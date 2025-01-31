import { CreateBondingCurveInput } from "@/types";
import { initProviders } from "@/util/initProviders";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair as Web3JsKeypair } from "@solana/web3.js";
import { confirmTransaction, processTransaction } from "programs";

export const createPumpService = () => {
  console.log("hello");
  const { umi, connection, rpcUrl, masterKp, sdk } = initProviders();

    const createBondingCurve= async (input: CreateBondingCurveInput) => {
      const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
      const curveSdk = sdk.getCurveSDK(mintKp.publicKey);
  
      const txBuilder = curveSdk.createBondingCurve(
        {...input, startSlot: null},
        mintKp,
        false
      );

  return await processTransaction(umi, txBuilder);
    }
    return {
      createBondingCurve
    }
};

export type PumpService = ReturnType<typeof createPumpService>;
