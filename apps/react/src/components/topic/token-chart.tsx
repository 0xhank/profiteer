import { useMemo } from "react";
import { pricesToCandles } from "../../utils/pricesToCandles";
import { CandleChart } from "./candle-chart";
import { useTokenPrices } from "../../hooks/useTokenPrices";
import { cn } from "../../utils/cn";

export const TokenChart = ({ mint, className }: { mint: string, className?: string }) => {
    const { tokenPrices } = useTokenPrices(mint);

    const candles = useMemo(() => {
        return pricesToCandles(tokenPrices, 15 * 60);
    }, [tokenPrices]);

    if (candles.length === 0) {
        return <div className="w-full h-full col-span-1">No data</div>;
    }
    return <CandleChart data={candles} colors={{ lineColor: "red" }} className={cn("w-full h-full col-span-1", className)} />;
};
