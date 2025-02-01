// #!/usr/bin/env node

import { Connection } from "@solana/web3.js";
import supabase from "./sbclient";
import { env } from "../bin/env";
import { updateSolPrice } from "./cron/updateSolPrice";

/* --------------------------------- START --------------------------------- */
const SOL_PRICE_UPDATE_INTERVAL = 1000 * 60; // 15 seconds 
export const start = async () => {
    const connection = new Connection(env.RPC_URL, "confirmed");
    updateSolPriceCron();
};

const updateSolPriceCron = async () => {
while (true) {
        await updateSolPrice();
        await new Promise((resolve) => setTimeout(resolve, SOL_PRICE_UPDATE_INTERVAL));
    }
  }