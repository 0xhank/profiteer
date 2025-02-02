import { TokenTradeForm } from "./token-trade-form";

import { useEffect, useMemo, useState } from "react";
import { useTokenData } from "../../hooks/useTokenData";
import supabase from "../../sbClient";
import TokenCard from "../common/token-card";
import { LineChart } from "./line-chart";
import { TokenBalance } from "./token-balance";

export const TokenContent = ({ mint }: { mint: string }) => {
    const { tokenData } = useTokenData({ mint });
    const [tokenPrices, setTokenPrices] = useState<
        { time: string; value: number }[]
    >([]);
    const [loading, setLoading] = useState(true);

    const [curveLiquidity, setCurveLiquidity] = useState<number | null>(null);

    // todo: only fetch prices from a certain window
    // todo: convert the prices into candles
    const fetchTokenPrices = async () => {
        // const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from("token_price_usd")
            .select("price_usd, created_at")
            .eq("mint", mint)
            // .gte("created_at", oneHourAgo)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(error);
        } else {
            setTokenPrices(
                data.map((price) => ({
                    time: price.created_at,
                    value: price.price_usd,
                }))
            );
            setLoading(false);
        }
    };

    const progress = useMemo(() => {
        if (!curveLiquidity) return null;
        const initialLiquidity = 793_100_000_000_000;
        return (initialLiquidity - curveLiquidity) / initialLiquidity;
    }, [curveLiquidity]);

    const fetchCurveLiquidity = async () => {
        const { data, error } = await supabase
            .from("curve_data")
            .select("virtual_token_reserves")
            .eq("mint", mint)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error(error);
        } else {
            setCurveLiquidity(data[0].virtual_token_reserves);
        }
    };

    useEffect(() => {
        fetchTokenPrices();
        fetchCurveLiquidity();
    }, [mint]);

    return (
        tokenData && (
            <div className="col-span-1 flex flex-col gap-8 items-center">
                {/* Token Header */}
                <div className="flex justify-center w-full">
                    <TokenCard token={tokenData} clickable={false} />
                </div>

                {/* Progress Bar */}
                {progress !== null && (
                    <div className="w-full flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span>Curve Progress</span>
                            <div>
                                <span className="text-red-600 font-bold">
                                    {(progress * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-red-600 h-2.5 rounded-full"
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Price Graph */}
                {loading ? (
                    <div>Loading...</div>
                ) : tokenPrices.length > 0 ? (
                    <LineChart
                        data={tokenPrices}
                        colors={{ lineColor: "red" }}
                        className="w-full"
                    />
                ) : (
                    <div>No price data</div>
                )}
                <TokenBalance token={tokenData} />

                <TokenTradeForm {...tokenData} />
            </div>
        )
    );
};
