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

export const TopStories = () => {
    const { tokens, isReady } = useTokens();
    const [startIndex, setStartIndex] = useState(0);

    if (!isReady) {
        return <LoadingPane className="h-12" />;
    }

    const handleNext = () => {
        setStartIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        setStartIndex((prev) => Math.max(prev - 1, 0));
    };

    const visibleTokens = Object.entries(tokens)
        .filter(([, token]) => token.volume12h && token.volume12h > 0)
        .sort((a, b) => (b[1].volume12h ?? 0) - (a[1].volume12h ?? 0));

    return (
        <div className="relative w-full max-w-[1170px] sm:overflow-hidden overflow-x-auto">
            <button
                onClick={handlePrev}
                disabled={startIndex === 0}
                className="absolute hidden sm:flex justify-center bg-gray-100 items-center z-[99999] top-1/2 h-full -translate-y-1/2 left-0 disabled:opacity-50 disabled:cursor-not-allowed w-8"
            >
                <LeftChevron className="w-4 h-4" />
            </button>

            <div
                className="w-full flex divide-x divide-white gap-1 sm:pl-8 border-y-0 sm:transition-transform sm:duration-300"
                style={{ transform: `translateX(-${startIndex * 25}%)` }}
            >
                {visibleTokens.map(([key, token], index) => (
                    <TopStoryItem key={`${key}`} token={token} index={index} />
                ))}
            </div>

            <button
                onClick={handleNext}
                disabled={startIndex >= visibleTokens.length - 1}
                className="absolute hidden sm:flex justify-center items-center bg-gray-100 z-[99999] top-1/2 h-full -translate-y-1/2 right-0 disabled:cursor-not-allowed w-8"
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
            className="relative h-full flex flex-col hover:cursor-pointer bg-white hover:bg-slate-50"
            onClick={() => navigate(`/wiki/${token.mint}`)}
        >
            <div className="absolute w-4 h-4 text-xs text-center bg-black text-white right-0">
                {index + 1}
            </div>
            <div className="flex flex-col pt-2 px-2 items-start h-full">
                {hasImage && (
                    <img
                        src={token.metadata.imageUri}
                        alt={token.metadata.name}
                        className="hidden md:block h-8 max-w-18 rounded-sm object-contain"
                    />
                )}
                <>
                    <p className="text-md font-light">
                        {token.metadata.symbol}
                    </p>
                </>
            </div>
            <hr className="my-1 mx-1 border border-gray-300" />
            <div className="flex md:flex-row justify-center items-center md:gap-1 pb-1 font-mono text-sm">
                <span className = "text-xs md:text-base">{formatVolume(token.volume12h ?? 0, token.priceUsd ?? 0)}{" "}</span>
                <span className="text-gray-500 text-[0.6rem] md:text-xs">[VOL]</span>
            </div>
        </div>
    );
};
