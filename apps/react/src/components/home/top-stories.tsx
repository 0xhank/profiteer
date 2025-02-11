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

    const visibleTokens = Object.entries(tokens)
        .filter(([, token]) => token.volume12h && token.volume12h > 0)
        .sort((a, b) => (b[1].volume12h ?? 0) - (a[1].volume12h ?? 0))
        .slice(startIndex, startIndex + itemsPerPage);

    return (
            <div className="relative w-full max-w-[1100px] pr-4">
                <button
                    onClick={handlePrev}
                    disabled={startIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LeftChevron className="w-4 h-4" />
                </button>

                <div className="w-full grid grid-cols-10 divide-x divide-black/70 border border-x-black/70 border-y-0">
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
                    <LeftChevron className="w-4 h-4 rotate-180" />
                </button>
            </div>
    );
};

export const LeftChevron = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            className={className}
        >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
        </svg>
    );
}
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
            className="relative h-full flex flex-col hover:cursor-pointer bg-white hover:bg-slate-50"
            onClick={() => navigate(`/wiki/${token.mint}`)}
        >
            <div className="absolute w-4 h-4 text-xs text-center bg-black text-white right-0">
                {index + 1}
            </div>
            <div className="flex flex-col pt-1 px-1 items-start h-full">
                {hasImage && (
                    <img
                        src={token.metadata.imageUri}
                        alt={token.metadata.name}
                        className="h-8 max-w-18 rounded-sm object-contain"
                    />
                )}
                    <>
                        <p className="text-md font-light">
                            {token.metadata.symbol}
                        </p>
                    </>
                
            </div>
            <hr className="my-1 mx-1 border border-gray-300" />
            <div className="flex justify-center items-center gap-1 pb-1 font-mono text-sm">
                    {formatVolume(token.volume12h ?? 0, token.priceUsd ?? 0)}{" "}
                    <span className="text-gray-500 text-xs">[VOL]</span>
            </div>
        </div>
    );
};
