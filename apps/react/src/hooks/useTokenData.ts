import { useTokens } from "./useTokens";

export const useTokenData = ({mint}: {mint: string}) => {
  const {tokens} = useTokens();

  const token = tokens[mint];
  if (!token) {
    return { tokenData: null };
  }
  return { tokenData: token };
 
};
