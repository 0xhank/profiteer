import { useTokens } from "./useTokens";

export const useToken= (mint: string) => {
    const { tokens, refreshTokens } = useTokens();

    const token = tokens[mint];

    return { token, refreshToken: async () => await refreshTokens([mint]) };
};
