import { useContext } from "react";
import { TokenListContext } from "../contexts/TokenProvider";

export function useTokens() {
    const context = useContext(TokenListContext);
    if (!context) {
        throw new Error("useTokenList must be used within a TokenListProvider");
    }
    return context;
}
