import { CreateBondingCurveInput } from "@/types";
import { initProviders } from "@/util/initProviders";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair as Web3JsKeypair } from "@solana/web3.js";
export const createPumpService = () => {
  const { umi, connection, provider, rpcUrl, masterKp, sdk } = initProviders();

  return {
    createBondingCurve: async (input: CreateBondingCurveInput) => {
      const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
      const curveSdk = sdk.getCurveSDK(mintKp.publicKey);
  
      const txBuilder = curveSdk.createBondingCurve(
        input,
        mintKp,
        false
      );

      await processTransaction(txBuilder);
      return input;
    },
  };
};

export type PumpService = ReturnType<typeof createPumpService>;
