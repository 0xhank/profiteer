
import { useParams } from "react-router-dom";
import { PageLayout } from "../components/page-layout";
import { useTokenData } from "../hooks/useTokenData";
import TokenCard from "../components/token-card";
import { TokenTradeForm } from "../components/token/token-trade-form";

export default function Token() {
  const params = useParams();
  if (!params.tokenId) {
    return <PageLayout>No tokenId</PageLayout>;
  }
  return <TokenContent mint={params.tokenId} />;
}

function TokenContent({mint}: {mint: string}) {
  const { isLoading, tokenData } = useTokenData({mint});

  if (isLoading) {
    return <PageLayout>loading...</PageLayout>;
  }

  if (!tokenData) {
    return <PageLayout>Token not found</PageLayout>;
  }

  return (
    <PageLayout>
      <div className="max-w-[1200px] flex flex-col gap-8 items-center mt-12">
        {/* Token Header */}
        <div className="flex justify-center w-[700px]">
          <TokenCard token={tokenData} clickable={false} />
        </div>

        {/* Price Graph */}
          <div
            className="w-full overflow-hidden"
            style={{ height: "400px", minWidth: "600px" }}
          >
            <iframe
              src={`https://dexscreener.com/solana/${tokenData.mint}?embed=1&theme=dark&trades=0&info=0`}
              height="100%"
              width="100%"
              className="bg-black/20"
            />
          </div>

          <TokenTradeForm {...tokenData} />
      </div>
    </PageLayout>
  );
}