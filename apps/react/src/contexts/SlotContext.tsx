import { createContext } from "react";

import { useEffect, useState } from "react";
import { useServer } from "../hooks/useServer";

type SlotContextType = {
    slot: number | null;
};
export const SlotContext = createContext<SlotContextType | null>(null);

export const SlotProvider = ({ children }: { children: React.ReactNode }) => {
    const server = useServer();
    const [slot, setSlot] = useState<number | null>(null);

    useEffect(() => {
        const pollSlot = async () => {
            const result = await server.getSlot.query();
            setSlot(result);
        };

        // Initial poll
        pollSlot();

        // Poll every 5 seconds
        const interval = setInterval(pollSlot, 600000);

        return () => clearInterval(interval);
    }, [server]);

    return (
        <SlotContext.Provider value={{ slot }}>{children}</SlotContext.Provider>
    );
};
