import { TokenTradeForm } from "./token-trade-form";

import { useEffect, useMemo, useState } from "react";
import { useFee } from "../../hooks/useFee";
import { useTokenData } from "../../hooks/useTokenData";
import { useTokenPrices } from "../../hooks/useTokenPrices";
import supabase from "../../sbClient";
import { LineChart } from "./line-chart";

export const TokenContent = ({ mint }: { mint: string }) => {
    const tokenData = useTokenData(mint);
    const { tokenPrices, loading } = useTokenPrices(mint);

    const [complete, setComplete] = useState<boolean | null>(null);

    useEffect(() => {
        if (tokenData) {
            setComplete(tokenData.complete ?? false);
        }
    }, [tokenData]);

    const { fee } = useFee(tokenData?.mint ?? "");
    const [curveLiquidity, setCurveLiquidity] = useState<number | null>(null);

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
        }
    };

    useEffect(() => {
        fetchCurveLiquidity();
    }, [mint]);

    return (
        tokenData && (
            <div className="col-span-1 flex flex-col gap-4 items-center">
                {/* Progress Bar */}

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

                {!complete ? (
                    <TokenTradeForm tokenData={tokenData} onSwap={onSwap} />
                ) : (
                    <p>This token has been migrated. </p>
                )}
            </div>
        )
    );
};
