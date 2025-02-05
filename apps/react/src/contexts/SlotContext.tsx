import { RealtimeChannel } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";
import supabase from "../sbClient";

type SlotContextType = {
    slot: number | null;
    isReady: boolean;
    error: string | null;
};

export const SlotContext = createContext<SlotContextType>({
    slot: null,
    isReady: false,
    error: null,
});

export const SlotProvider = ({ children }: { children: React.ReactNode }) => {
    const [slot, setSlot] = useState<number | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInserts = (payload: { new: { slot: number } }) => {
        setSlot(payload.new.slot);
        if (!isReady) {
            setIsReady(true);
        }
    };

    useEffect(() => {
        let sub: RealtimeChannel | null = null;

        const getInitialValue = async () => {
            try {
                const { data, error } = await supabase
                    .from("slot")
                    .select("slot")
                    .limit(1);
                if (error) throw error;
                setSlot(data[0].slot);
            } catch {
                setError("Error getting initial slot value");
            }
        };

        getInitialValue();
        sub = supabase
            .channel("slot")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "slot" },
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
        <SlotContext.Provider value={{ slot, isReady, error }}>
            {children}
        </SlotContext.Provider>
    );
};
