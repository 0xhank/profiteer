import { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import supabase from "../sbClient";

export const useTokenPrices = (mint: string) => {
    const [tokenPrices, setTokenPrices] = useState<
        { time: string; value: number }[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);

    const sub = useRef<RealtimeChannel | null>(null);

    const stop = useCallback(async () => {
        if (sub.current) {
            supabase.removeChannel(sub.current);
        }
        setRunning(false);
    }, []);

    const start = useCallback(async () => {
        if (running) {
            return;
        }
        await stop();
        setRunning(true);

        const handleInserts = (payload: {
            new: { price_usd: number; created_at: string };
        }) => {
            setTokenPrices((prev) => [
                ...prev,
                { time: payload.new.created_at, value: payload.new.price_usd },
            ]);
        };

        sub.current = supabase
            .channel("token_price_usd")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "token_price_usd",
                    filter: `mint=eq.${mint}`,
                },
                handleInserts
            )
            .subscribe();

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
    }, [running, mint, stop]);

    useEffect(() => {
        start();
        return () => {
            stop();
        };
    }, [mint]);

    return { tokenPrices, loading };
};
