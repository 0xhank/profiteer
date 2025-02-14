import { useMemo } from "react";
import { pricesToCandles } from "../../utils/pricesToCandles";
import { CandleChart } from "./candle-chart";
import { useTokenPrices } from "../../hooks/useTokenPrices";

export const TokenChart = ({ mint }: { mint: string }) => {
    const { tokenPrices } = useTokenPrices(mint);

    const candles = useMemo(() => {
        return pricesToCandles(tokenPrices, 15 * 60);
    }, [tokenPrices]);

    return <CandleChart data={candles} colors={{ lineColor: "red" }} className="w-full h-full col-span-1" />;
};
