export function calculateFee(currentSlot: number, startSlot: number): number {
    const slotsPassed = currentSlot - startSlot;
    let feeBps = 0

    if (slotsPassed < 150) {
        // Phase 1: 99% fee between slot 0 - 150
        feeBps = 9900
    } else if (slotsPassed >= 150 && slotsPassed <= 250) {
        // Phase 2: Linear decrease between 150 - 250
        // Calculate the minimum fee bps (at slot 250) scaled by 10000 for precision
        feeBps = Math.floor((-8300000 * slotsPassed + 2162600000) / 1000000);
    } else if (slotsPassed > 250) {
        // Phase 3: 1% fee after 250
        feeBps = 100
    }

    return feeBps;
}

export function getSolAmountWithFee(amountBeforeFees: bigint, currentSlot: number, startSlot: number){
    const feeBps = calculateFee(currentSlot, startSlot)
    const nonFeeBps = 10000 - feeBps
    const solAmountWithFee = 10000n * amountBeforeFees / BigInt(nonFeeBps)

    return {feeBps, solAmountWithFee }
}

