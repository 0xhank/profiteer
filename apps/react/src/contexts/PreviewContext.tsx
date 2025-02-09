import { createContext, useContext, useEffect, useState } from "react";

type PreviewData = {
    href: string;
    rect: DOMRect;
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

const PreviewOverlay = ({ rect }: { rect: DOMRect }) => {
    return (
        <div
            className="fixed z-50 bg-white shadow-lg rounded p-4 max-w-md"
            style={{
                top: `${rect.bottom + 8}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: "translateX(-50%)",
            }}
        >
            hello world
        </div>
    );
};
