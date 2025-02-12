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
        time: number;
        value: number;
    }[],
    candleTimespanSecs: number
) => {
    // 1. sort prices by time
    const sortedPrices = tokenPrices.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    // 2. group prices into buckets of candleTimespan
    const candleGroups: Map<number, number[]> = new Map();

    const addPriceToGroup = (price: { time: number; value: number }) => {
        const groupLength = candleTimespanSecs * 1000;

        const groupStartTime = (Math.floor(price.time / groupLength) * groupLength) / 1000;
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
    // set the close price of each candle to the open price of the next candle
    for (let i = 0; i < candles.length - 1; i++) {
        candles[i].close = candles[i + 1].open;
    }

    return candles;
}