import { useContext } from "react";
import { SlotContext } from "../contexts/SlotContext";

export const useSlot = () => {
    const context = useContext(SlotContext);
    if (!context) {
        throw new Error("useSlot must be used within a SlotProvider");
    }
    return context;
};
