import { useParams } from "react-router-dom";
import { PageLayout } from "../components/page-layout";
import TokenCard from "../components/token-card";
import { CandleChart } from "../components/token/candle-chart";
import { TokenBalance } from "../components/token/token-balance";
import { TokenTradeForm } from "../components/token/token-trade-form";
import WikiArticle from "../components/wiki-article";
import { useTokenData } from "../hooks/useTokenData";

export default function Token() {
    const params = useParams();
    if (!params.tokenId) {
        return <PageLayout>No tokenId</PageLayout>;
    }
    return <TokenContent mint={params.tokenId} />;
}

const candleTest = [
    { time: "2019-04-11", open: 80.01, close: 81.0, high: 82.0, low: 79.0 },
    { time: "2019-04-12", open: 96.63, close: 97.0, high: 98.0, low: 95.0 },
    { time: "2019-04-13", open: 76.64, close: 77.0, high: 78.0, low: 75.0 },
    { time: "2019-04-14", open: 81.89, close: 82.0, high: 83.0, low: 80.0 },
    { time: "2019-04-15", open: 74.43, close: 75.0, high: 76.0, low: 73.0 },
    { time: "2019-04-16", open: 80.01, close: 81.0, high: 82.0, low: 79.0 },
    { time: "2019-04-17", open: 96.63, close: 97.0, high: 98.0, low: 95.0 },
    { time: "2019-04-18", open: 76.64, close: 77.0, high: 78.0, low: 75.0 },
    { time: "2019-04-19", open: 81.89, close: 82.0, high: 83.0, low: 80.0 },
    { time: "2019-04-20", open: 74.43, close: 75.0, high: 76.0, low: 73.0 },
];

function TokenContent({ mint }: { mint: string }) {
    const { tokenData } = useTokenData({ mint });

    if (!tokenData) {
        return <PageLayout>Token not found</PageLayout>;
    }

    return (
        <PageLayout>
            <div className="max-w-[1200px] h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-12">
                {/* Wiki Article on the left */}
                <div className="col-span-1 overflow-y-auto h-full">
                    <WikiArticle />
                </div>
                {/* Rest of the content */}
                <div className="col-span-1 flex flex-col gap-8 items-center">
                    {/* Token Header */}
                    <div className="flex justify-center w-[700px]">
                        <TokenCard token={tokenData} clickable={false} />
                    </div>

                    {/* Price Graph */}
                    <CandleChart
                        data={candleTest}
                        colors={{ lineColor: "red" }}
                        className="w-[700px]"
                    />
                    <TokenBalance token={tokenData} />

                    <TokenTradeForm {...tokenData} />
                </div>
            </div>
        </PageLayout>
    );
}
