import { useCallback, useEffect, useRef, useState } from "react";
import supabase from "../sbClient";
import { RealtimeChannel } from "@supabase/supabase-js";

export const useSlot = () => {
    const [slot, setSlot] = useState<number | null>(null);
    const [running, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sub = useRef<RealtimeChannel | null>(null);

    const handleInserts = (payload: { new: { slot: number } }) => {
        setSlot(payload.new.slot);
        if (!running) {
            setIsRunning(true);
        }
    };

    const stop = useCallback(async () => {
        if (sub.current) {
            supabase.removeChannel(sub.current);
        }
        setIsRunning(false);
    }, []);

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

    const start = useCallback(async () => {
        if (running) {
            return;
        }

        getInitialValue();
        sub.current = supabase
            .channel("slot")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "slot" },
                handleInserts
            )
            .subscribe();
    }, [running]);

    useEffect(() => {
        getInitialValue();
        return () => {
            if (sub.current) {
                supabase.removeChannel(sub.current);
            }
        };
    }, []);
    return { slot, running, error, start, stop };
};
