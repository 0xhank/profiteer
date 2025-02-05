// #!/usr/bin/env node

import { Connection } from "@solana/web3.js";
import { env } from "../bin/env";
import { updateSolPrice } from "./cron/updateSolPrice";
import supabase from "./sbclient";

/* --------------------------------- START --------------------------------- */
const SOL_PRICE_UPDATE_INTERVAL = 1000 * 60; // 15 seconds
export const start = async () => {
    updateSolPriceCron();

    const connection = new Connection(env.RPC_URL, "confirmed");
    // add a slot listener
    const slotListener = connection.onSlotChange(async (slotInfo) => {
        console.log("slot", slotInfo.slot);
        await supabase
            .from("slot")
            .upsert(
                { slot: slotInfo.slot, id: 1 },
            );
    });
    return {
        stop: () => {
            connection.removeSlotChangeListener(slotListener);
        },
    };
};

const updateSolPriceCron = async () => {
    while (true) {
        await updateSolPrice();
        await new Promise((resolve) =>
            setTimeout(resolve, SOL_PRICE_UPDATE_INTERVAL)
        );
    }
};
