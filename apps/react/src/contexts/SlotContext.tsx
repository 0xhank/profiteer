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

        const interval = setInterval(pollSlot, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <SlotContext.Provider value={{ slot }}>{children}</SlotContext.Provider>
    );
};
