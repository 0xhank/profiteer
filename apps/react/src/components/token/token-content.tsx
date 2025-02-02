import { TokenTradeForm } from "./token-trade-form";

import { useEffect, useState } from "react";
import { useTokenData } from "../../hooks/useTokenData";
import supabase from "../../sbClient";
import TokenCard from "../common/token-card";
import { TokenBalance } from "./token-balance";
import { LineChart } from "./line-chart";

export const TokenContent = ({ mint }: { mint: string }) => {
    const { tokenData } = useTokenData({ mint });
    const [tokenPrices, setTokenPrices] = useState<{ time: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTokenPrices = async () => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from("token_price_usd")
            .select("price_usd, created_at")
            .eq("mint", mint)
            // .gte("created_at", oneHourAgo)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(error);
        } else {
            setTokenPrices(data.map((price) => ({ time: price.created_at, value: price.price_usd })));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokenPrices();
    }, [mint]);

    return (
        tokenData && (
            <div className="col-span-1 flex flex-col gap-8 items-center">
                {/* Token Header */}
                <div className="flex justify-center w-full">
                    <TokenCard token={tokenData} clickable={false} />
                </div>

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
