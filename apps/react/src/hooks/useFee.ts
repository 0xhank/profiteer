import { useEffect, useState } from "react";
import { useSlot } from "./useSlot";
import { useTokenData } from "./useTokenData";

export const useFee = (mint: string) => {
    const [fee, setFee] = useState<number>(0);
    const {slot, start, stop, running} = useSlot();
    const tokenData = useTokenData(mint);

    useEffect(() => {
        if(tokenData == null || slot == null) return;
        const fee = calculateFee(slot, tokenData.metadata.startSlot);
        if (fee > 0.01 && !running) {
            start();
        } else if (fee <= 0.01 && running) {
            stop();
        }

        setFee(calculateFee(slot, tokenData.metadata.startSlot));
    }, [slot, tokenData, running]);

    return { fee, setFee };
};


function calculateFee(currentSlot: number, startSlot: number): number {
    const slotsPassed = currentSlot - startSlot;
    let feeBps = 0

    if (slotsPassed < 150) {
        // Phase 1: 99% fee between slot 0 - 150
        feeBps = .99
    } else if (slotsPassed >= 150 && slotsPassed <= 250) {
        // Phase 2: Linear decrease between 150 - 250
        // Calculate the minimum fee bps (at slot 250) scaled by 10000 for precision
        feeBps = Math.floor((-8300000 * slotsPassed + 2162600000) / 1000000) / 10000;
    } else if (slotsPassed > 250) {
        // Phase 3: 1% fee after 250
        feeBps = .01
    }

    return feeBps;
}

