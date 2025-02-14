import { TokenTradeForm } from "./token-trade-form";

import { useEffect, useMemo, useState } from "react";
import { useFee } from "../../hooks/useFee";
import { useToken } from "../../hooks/useToken";
import { useTokenPrices } from "../../hooks/useTokenPrices";
import supabase from "../../sbClient";
import { pricesToCandles } from "../../utils/pricesToCandles";
import { LoadingPane } from "../common/loading";
import { CandleChart } from "./candle-chart";

export const TokenContent = ({ mint }: { mint: string }) => {
    const { token: tokenData } = useToken(mint);
    const { tokenPrices } = useTokenPrices(mint);

    const [complete, setComplete] = useState<boolean | null>(null);

    useEffect(() => {
        if (tokenData) {
            setComplete(tokenData.complete ?? false);
        }
    }, [tokenData]);

    const { fee } = useFee(tokenData?.mint ?? "");
    const [curveLiquidity, setCurveLiquidity] = useState<number | null>(null);
    const [reserves, setReserves] = useState<{
        virtualSolReserves: number;
        virtualTokenReserves: number;
    } | null>(null);

    const onSwap = () => {
        fetchCurveLiquidity();
    };

    const progress = useMemo(() => {
        if (curveLiquidity == null) return null;
        const initialLiquidity = 793_100_000_000_000;
        return (initialLiquidity - curveLiquidity) / initialLiquidity;
    }, [curveLiquidity]);

    const fetchCurveLiquidity = async () => {
        const { data, error } = await supabase
            .from("curve_data")
            .select(
                "real_token_reserves, virtual_token_reserves, virtual_sol_reserves, complete"
            )
            .eq("mint", mint)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.error(error);
        } else {
            setCurveLiquidity(data[0].real_token_reserves);
            setComplete(data[0].complete);
            setReserves({
                virtualSolReserves: data[0].virtual_sol_reserves,
                virtualTokenReserves: data[0].virtual_token_reserves,
            });
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchCurveLiquidity();

        // Set up realtime subscription
        const channel = supabase
            .channel("curve_data_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "curve_data",
                    filter: `mint=eq.${mint}`,
                },
                (payload) => {
                    const newData = payload.new;
                    setCurveLiquidity(newData.real_token_reserves);
                    setComplete(newData.complete);
                    setReserves({
                        virtualSolReserves: newData.virtual_sol_reserves,
                        virtualTokenReserves: newData.virtual_token_reserves,
                    });
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            channel.unsubscribe();
        };
    }, [mint]);

    const candles = useMemo(() => {
        return pricesToCandles(tokenPrices, 15 * 60);
    }, [tokenPrices]);

    if (!tokenData || !reserves) return <LoadingPane className="h-full" />;

    return (
        tokenData &&
        reserves && (
            <div className="col-span-1 flex flex-col gap-4 items-center">
                {!complete ? (
                    <TokenTradeForm
                        tokenData={tokenData}
                        onSwap={onSwap}
                        reserves={reserves}
                    />
                ) : (
                    <p>This token has been migrated. </p>
                )}
                <CandleChart
                    data={candles}
                    colors={{ lineColor: "red" }}
                    className="w-full"
                />
                {fee > 0.01 && (
                    <div className="text-left w-full">
                        <details className="cursor-pointer">
                            <summary className="flex items-center">
                                <p>Early Bird Fee: {(fee - 0.01) * 100}%</p>
                                <svg
                                    className="w-4 h-4 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 12v4M12 8h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                                    />
                                </svg>
                            </summary>
                            <div className="mt-2 text-sm text-gray-600 pl-2">
                                The early bird fee is a temporary boost in fees
                                that decreases over time. This protects early
                                supporters from pump and dumps. After 250 slots
                                the fee is removed.
                            </div>
                        </details>
                    </div>
                )}
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

                <hr className="w-full border-t-1 border-black/30" />
            </div>
        )
    );
};
