import { Time, UTCTimestamp } from "lightweight-charts";

type Candle = {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
};

export const pricesToCandles = (
    tokenPrices: {
        time: string;
        value: number;
    }[],
    candleTimespan: number
) => {
    // 1. sort prices by time
    const sortedPrices = tokenPrices.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // 2. group prices into buckets of candleTimespan
    const candleGroups: Map<number, number[]> = new Map();

    const addPriceToGroup = (price: { time: string; value: number }) => {
        const groupStartTime = new Date(price.time).getTime() - (new Date(price.time).getTime() % (candleTimespan * 1000));
        if (!candleGroups.has(groupStartTime)) {
            candleGroups.set(groupStartTime, []);
        }
        candleGroups.get(groupStartTime)?.push(price.value);
    };
    sortedPrices.forEach(addPriceToGroup);

    // 3. create candles from the grouped prices
    const candles: Candle[] = [];
    for (const [time, prices] of candleGroups.entries()) {
        const candle: Candle = {
            time: time as UTCTimestamp,
            open: prices[0],
            high: Math.max(...prices),
            low: Math.min(...prices),
            close: prices[prices.length - 1],
        };
        candles.push(candle);
    }
    // 4. backfill missing candles
    const lastCandle = candles[candles.length - 1];
    const lastCandleTime = lastCandle.time;
    const now = new Date().getTime();
    const timeDiff = now - lastCandleTime;
    const missingCandles = Math.floor(timeDiff / (candleTimespan * 1000));
    for (let i = 0; i < missingCandles; i++) {
        candles.push({
            time: lastCandleTime + (i + 1) * candleTimespan * 1000 as UTCTimestamp,
            open: lastCandle.close,
            high: lastCandle.close,
            low: lastCandle.close,
            close: lastCandle.close,
        });
    }

    return candles;
}