import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Token } from "shared/src/types/token";
import { useTokens } from "../../hooks/useTokens";
import { formatVolume } from "../../utils/formatPrice";
import { LoadingPane } from "../common/loading";

export interface TokenPriceData {
    priceUsd: number | null;
    priceChange24h: number | null;
}

export const TokenList = () => {
    const { tokens, isReady } = useTokens();
    const [startIndex, setStartIndex] = useState(0);
    const itemsPerPage = 10;

    if (!isReady) {
        return <LoadingPane className="h-12" />;
    }

    const handleNext = () => {
        setStartIndex((prev) =>
            Math.min(
                prev + itemsPerPage,
                Object.keys(tokens).length - itemsPerPage
            )
        );
    };

    const handlePrev = () => {
        setStartIndex((prev) => Math.max(prev - itemsPerPage, 0));
    };

    const visibleTokens = Object.entries(tokens).filter(([key, token]) => token.volume12h && token.volume12h > 0).sort((a, b) => (b[1].volume12h ?? 0) - (a[1].volume12h ?? 0)).slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-left">Top stories</p>
            <div className="relative w-full">
                <button
                    onClick={handlePrev}
                    disabled={startIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ←
                </button>

                <div className="w-full grid grid-cols-10 gap-4">
                    {visibleTokens.map(([key, token], index) => (
                        <TopStoryItem
                            key={key}
                            token={token}
                            index={startIndex + index}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={
                        startIndex >= Object.keys(tokens).length - itemsPerPage
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    →
                </button>
            </div>
        </div>
    );
};

export const TopStoryItem = ({
    token,
    index,
}: {
    token: Token;
    index: number;
}) => {
    const navigate = useNavigate();
    const hasImage = !token.metadata.imageUri.includes("api.");
    return (
        <div
            className="h-full flex flex-col border border-black hover:cursor-pointer hover:bg-slate-50"
            onClick={() => navigate(`/wiki/${token.mint}`)}
        >
            <div className="flex flex-row gap-1 items-center">
                <div className="w-4 h-4 text-xs bg-black text-white">
                    {index + 1}
                </div>
                <p className="text-xs opacity-70">Vol: {formatVolume(token.volume12h ?? 0, token.priceUsd ?? 0)}</p>
            </div>
            <div className="flex flex-col gap-1 pb-1 px-1">
                {hasImage && (
                    <p className="text-xs uppercase">
                        {token.metadata.name.slice(0, 20).replace(/_/g, " ") +
                            (token.metadata.name.length > 20 ? "..." : "")}
                    </p>
                )}
                {!hasImage && (
                    <p className="indent-4 text-xs uppercase">
                        {token.metadata.name.slice(0, 50).replace(/_/g, " ") +
                            (token.metadata.name.length > 50 ? "..." : "")}
                    </p>
                )}
                {hasImage && (
                    <img
                        src={token.metadata.imageUri}
                        alt={token.metadata.name}
                        className="max-h-12 object-contain"
                    />
                )}
            </div>
        </div>
    );
};
