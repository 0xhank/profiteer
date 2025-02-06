// #!/usr/bin/env node

import { Connection } from "@solana/web3.js";
import { env } from "../bin/env";
import { updateSolPrice } from "./cron/updateSolPrice";
import supabase from "./sbclient";

/* --------------------------------- START --------------------------------- */
const SOL_PRICE_UPDATE_INTERVAL = 1000 * 60; // 15 seconds
export const start = async () => {
    const stopPriceUpdate = updateSolPriceCron();
    const connection = new Connection(env.RPC_URL, "confirmed");

    const slotListener = connection.onSlotChange(async (slotInfo) => {
        await supabase.from("slot").upsert({ slot: slotInfo.slot, id: 1 });
    });

    // Handle process shutdown
    const cleanup = () => {
        connection.removeSlotChangeListener(slotListener);
        stopPriceUpdate();
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    return { stop: cleanup };
};

const updateSolPriceCron = () => {
    let running = true;

    const loop = async () => {
        while (running) {
            await updateSolPrice();
            await new Promise((resolve) =>
                setTimeout(resolve, SOL_PRICE_UPDATE_INTERVAL)
            );
        }
    };

    loop();
    return () => {
        running = false;
    };
};
