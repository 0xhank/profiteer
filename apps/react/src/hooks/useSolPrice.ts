import { useContext } from "react";
import { SolPriceContext } from "../contexts/SolPriceContext";

export const useSolPrice = () => {
  const context = useContext(SolPriceContext);
  if (!context) {
    throw new Error("useSolanaPrice must be used within a SolanaPriceProvider");
  }
  return context;
};
