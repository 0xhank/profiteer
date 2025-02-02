import { useTokens } from "./useTokens";

export const useTokenData = (mint: string) => {
    const { tokens } = useTokens();

    const token = tokens[mint];
    if (!token) {
        return null;
    }
    return token;
};
