import { CandleChart } from "./candle-chart";
import { TokenTradeForm } from "./token-trade-form";

import { useTokenData } from "../../hooks/useTokenData";
import TokenCard from "../common/token-card";
import { TokenBalance } from "./token-balance";

const candleTest = [
    { time: "2019-04-11", open: 80.01, close: 81.0, high: 82.0, low: 79.0 },
    { time: "2019-04-12", open: 96.63, close: 97.0, high: 98.0, low: 95.0 },
    { time: "2019-04-13", open: 76.64, close: 77.0, high: 78.0, low: 75.0 },
    { time: "2019-04-14", open: 81.89, close: 82.0, high: 83.0, low: 80.0 },
    { time: "2019-04-15", open: 74.43, close: 75.0, high: 76.0, low: 73.0 },
    { time: "2019-04-16", open: 80.01, close: 81.0, high: 82.0, low: 79.0 },
    { time: "2019-04-17", open: 96.63, close: 97.0, high: 98.0, low: 95.0 },
    { time: "2019-04-18", open: 76.64, close: 77.0, high: 78.0, low: 75.0 },
    { time: "2019-04-19", open: 81.89, close: 82.0, high: 83.0, low: 80.0 },
    { time: "2019-04-20", open: 74.43, close: 75.0, high: 76.0, low: 73.0 },
];

export const TokenContent = ({ mint }: { mint: string }) => {
    const { tokenData } = useTokenData({ mint });
    return (
        tokenData && (
            <div className="col-span-1 flex flex-col gap-8 items-center">
                {/* Token Header */}
                <div className="flex justify-center w-full">
                    <TokenCard token={tokenData} clickable={false} />
                </div>

                {/* Price Graph */}
                <CandleChart
                    data={candleTest}
                    colors={{ lineColor: "red" }}
                    className="w-full"
                />
                <TokenBalance token={tokenData} />

                <TokenTradeForm {...tokenData} />
            </div>
        )
    );
};
