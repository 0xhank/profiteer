import { TokenListContext } from "../contexts/TokenListContext";
import { useContext } from "react";

export function useTokenList() {
  const context = useContext(TokenListContext);
  if (!context) {
    throw new Error("useTokenList must be used within a TokenListProvider");
  }
  return context;
}
