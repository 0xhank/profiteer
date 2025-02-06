import { RealtimeChannel } from "@supabase/supabase-js";
import { createContext, useState, useEffect } from "react";
import supabase from "../sbClient";

interface SolanaPriceContextType {
    priceUSD: number;
    isReady: boolean;
}

export const SolPriceContext = createContext<SolanaPriceContextType>({
    priceUSD: 0, // Default fallback value
    isReady: false,
});

export const SolPriceProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [priceUSD, setPriceUSD] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // Listen to inserts
    const handleInserts = (payload: { new: { price_usd: number } }) => {
        setPriceUSD(payload.new.price_usd);
        if (!isReady) {
            setIsReady(true);
        }
    };

    useEffect(() => {
        let sub: RealtimeChannel | null = null;
        const getInitialValue = async () => {
            try {
                // get initial value
                const { data, error } = await supabase
                    .from("sol_price_usd")
                    .select("price_usd")
                    .limit(1)
                if (error) {
                    throw error;
                }
                setPriceUSD(data[0].price_usd);
            } catch {
                setPriceUSD(0);
            }
        };

        getInitialValue();
        sub = supabase
            .channel("sol_price_usd")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "sol_price_usd" },
                handleInserts
            )
            .subscribe();
        return () => {
            if (sub) {
                supabase.removeChannel(sub);
            }
        };
    }, []);

    return (
        <SolPriceContext.Provider value={{ priceUSD, isReady }}>
            {children}
        </SolPriceContext.Provider>
    );
};
