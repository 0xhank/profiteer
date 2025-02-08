import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Token } from "shared/src/types/token";
import { useTokens } from "../../hooks/useTokens";

export interface TokenPriceData {
    priceUsd: number | null;
    priceChange24h: number | null;
}

export const TokenList = () => {
    const { tokens, isReady } = useTokens();
    const [startIndex, setStartIndex] = useState(0);
    const itemsPerPage = 10;

    if (!isReady) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 dark:bg-gray-700 h-24 rounded-xl"
                    ></div>
                ))}
            </div>
        );
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

    const visibleTokens = Object.entries(tokens).slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
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
                    <TokenItem
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
    );
};

export const TokenItem = ({
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
            className="relative p-1 h-full flex flex-col gap-1 items-center border border-black hover:cursor-pointer hover:bg-slate-50"
            onClick={() => navigate(`/wiki/${token.mint}`)}
        >
            <div className="absolute left-0 top-0 w-4 h-4 text-xs bg-black text-white">
                {index + 1}
            </div>
            {hasImage && (
                <p className="indent-4 text-xs uppercase">
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
    );
};
