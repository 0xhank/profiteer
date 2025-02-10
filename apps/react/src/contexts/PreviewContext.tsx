import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTokenDataFromTopic } from "../sbClient";
import { formatNumber, formatPrice } from "../utils/formatPrice";
import { useToken } from "../hooks/useToken";

type PreviewData = {
    href: string;
    rect: DOMRect;
    topic: string;
} | null;

type PreviewContextType = {
    previewData: PreviewData;
    setPreviewData: (data: PreviewData) => void;
};

const PreviewContext = createContext<PreviewContextType | null>(null);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
    const [previewData, setPreviewData] = useState<PreviewData>(null);

    useEffect(() => {
        let showTimeout: NodeJS.Timeout;

        const handleMouseEnter = (e: MouseEvent) => {
            const link = e.target as HTMLElement;
            if (link.tagName.toLowerCase() === "a") {
                showTimeout = setTimeout(() => {
                    setPreviewData({
                        href: (link as HTMLAnchorElement).href,
                        topic: (link as HTMLAnchorElement).href.split("/")[4],
                        rect: link.getBoundingClientRect(),
                    });
                }, 400);
            }
        };

        const handleMouseLeave = () => {
            clearTimeout(showTimeout);
            setPreviewData(null);
        };

        document.addEventListener("mouseover", handleMouseEnter);
        document.addEventListener("mouseout", handleMouseLeave);

        return () => {
            clearTimeout(showTimeout);
            document.removeEventListener("mouseover", handleMouseEnter);
            document.removeEventListener("mouseout", handleMouseLeave);
        };
    }, []);

    return (
        <PreviewContext.Provider value={{ previewData, setPreviewData }}>
            {children}
            {previewData && <PreviewOverlay {...previewData} />}
        </PreviewContext.Provider>
    );
}

export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (!context)
        throw new Error("usePreview must be used within PreviewProvider");
    return context;
};

const PreviewOverlay = ({ rect, topic }: { rect: DOMRect; topic: string }) => {
    const [tokenMetadata, setTokenMetadata] = useState<Awaited<ReturnType<typeof getTokenDataFromTopic>> | null>(null);
    const tokenData = useToken(tokenMetadata?.mint ?? "").token;
    const [loading, setLoading] = useState(true);

    const sanitizedTopic = decodeURIComponent(topic)
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    useEffect(() => {
        const fetchArticleList = async () => {
            const tokenData = await getTokenDataFromTopic(topic);
            setTokenMetadata(tokenData);
        };
        fetchArticleList().then(() => setLoading(false));
    }, []);

    const priceChange = useMemo(() => {
        if (!tokenData?.pastPrices?.price1h || !tokenData?.priceUsd) return [0, 'text-gray-500'];
        
        const priceChange = ((tokenData.priceUsd) - (tokenData.pastPrices.price1h)) / (tokenData.pastPrices.price1h);
        const color = priceChange === 0 ? 'text-gray-500' : priceChange > 0 ? 'text-green-500' : 'text-red-500';
        return [formatNumber(priceChange * 100, {showZero: true, fractionDigits: 2}), color];
    }, [tokenData]);

    return (
        <div
            className="fixed z-50 bg-white shadow-lg p-4 w-54 border"
            style={{
                top: `${rect.bottom + 8}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: "translateX(-50%)",
            }}
        >
            {loading ? (
                <span className="text-gray-500">Loading Token Data</span>
            ) : tokenMetadata ? (
                <div className="relative">
                    <img src={tokenMetadata.uri} alt="Preview" className="h-7 rounded-sm mb-2" />
                    <p className="text-lg font-bold">{sanitizedTopic}</p>
                    <p className="text-gray-500 text-sm">${tokenMetadata.symbol}</p>
                    <hr className="my-2" />
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-mono">${formatNumber((tokenData?.volume12h ?? 0) * (tokenData?.priceUsd ?? 0), {short: true, showZero: true, decimals: 9, fractionDigits: 2})} <span className="text-gray-500 text-xs">VOLUME[12HR]</span></p>
                        <p className="text-sm font-mono">${formatNumber((tokenData?.metadata?.supply ?? 0) * (tokenData?.priceUsd ?? 0), {short: true, showZero: true, decimals: 9, fractionDigits: 2})} <span className="text-gray-500 text-xs">MARKET CAP</span></p>
                    </div>
                    
                    <div className="absolute top-0 right-0 font-mono text-xs flex flex-col gap-1 items-end">
                        <span className="bg-black px-2 text-white">${formatPrice(tokenData?.priceUsd ?? 0)}</span>
                        <div className={`text-xs flex flex-row items-center ${priceChange[1]}`}><span>{priceChange[0]}%</span><span className="text-gray-500 text-[.75em]">[1hr]</span></div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">                     
                    <span className="text-gray-500">No token found for <span className="font-bold text-black">{sanitizedTopic}</span></span>
                </div>
            )}
        </div>
    );
};
