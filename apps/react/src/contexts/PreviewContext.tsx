import { createContext, useContext, useEffect, useState } from "react";
import { getImage, getTokenDataFromTopic } from "../sbClient";
import { LoadingPane } from "../components/common/loading";

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
    const [tokenData, setTokenData] = useState<Awaited<ReturnType<typeof getTokenDataFromTopic>> | null>(null);
    const [loading, setLoading] = useState(true);

    const sanitizedTopic = topic
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    useEffect(() => {
        const fetchArticleList = async () => {
            const tokenData = await getTokenDataFromTopic(topic);
            setTokenData(tokenData);
        };
        fetchArticleList().then(() => setLoading(false));
    }, []);

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
            ) : tokenData ? (
                <div className="relative">
                    <img src={tokenData.uri} alt="Preview" className="w-8 h-8 rounded-sm mb-2" />
                    <p className="text-lg font-bold">{sanitizedTopic}</p>
                    <p className="text-gray-500 text-sm">${tokenData.symbol}</p>
                    <hr className="my-2" />
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-mono">$69M <span className="text-gray-500 text-xs">VOLUME[24hr]</span></p>
                        <p className="text-sm font-mono">$420M <span className="text-gray-500 text-xs">MARKET CAP</span></p>
                    </div>
                    
                    <p className="absolute top-0 right-0 font-mono text-xs flex flex-col gap-1">
                        <span className="bg-black px-2 text-white">$0.04</span>
                        <div className="text-green-500 text-xs flex flex-row items-center"><span>10%</span><span className="text-gray-500 text-[.75em]">[12hr]</span></div>
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-2">                     
                    <span className="text-gray-500">No token found for <span className="font-bold text-black">{sanitizedTopic}</span></span>
                </div>
            )}
        </div>
    );
};
