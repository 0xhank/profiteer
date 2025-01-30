import { useEffect, useState } from "react";
import { Token } from "shared/src/types/token";
import { useServer } from "./use-server";

export const useTokenData = ({mint}: {mint: string}) => {
  const [tokenData, setTokenData] = useState<Token | null>(null);
  const { getTokenByMint } = useServer();

  const [isLoading, setIsLoading] = useState(true);
  const fetchToken = async () => {
    setIsLoading(true);
        try {
          const token = await getTokenByMint.query({ tokenMint: mint });
          setTokenData(token || null);
        } catch (error) {
          console.error('Error checking token status:', error);
        } finally {
          setIsLoading(false);
        }
    };
  

  useEffect(() => {
    fetchToken();
  }, [mint]);


  const refreshToken = () => {  
    fetchToken();
  };
  return { tokenData, isLoading, refreshToken };
 
};
