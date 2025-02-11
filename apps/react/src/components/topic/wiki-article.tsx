import { useEffect, useState } from "react";
import { ArticlePreview } from "../common/article-preview";
import { Link } from "react-router-dom";

const WikiArticle = ({ articleHtml }: { articleHtml: string }) => {
    const [previewData, setPreviewData] = useState<{
        href: string;
        rect: DOMRect;
    } | null>(null);

    const handleMouseEnter = (e: MouseEvent) => {
        const link = e.target as HTMLAnchorElement;
        console.log(link);
        if (link.tagName === "a") {
            setPreviewData({
                href: link.href,
                rect: link.getBoundingClientRect(),
            });
        }
    };

    const handleMouseLeave = () => {
        setPreviewData(null);
    };

    useEffect(() => {
        const article = document.getElementById("article");
        article?.addEventListener("mouseover", handleMouseEnter);
        article?.addEventListener("mouseout", handleMouseLeave);

        return () => {
            article?.removeEventListener("mouseover", handleMouseEnter);
            article?.removeEventListener("mouseout", handleMouseLeave);
        };
    }, []);

    return (
        <>
            <div
                id="article"
                className="w-full"
                dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
            {previewData && <PreviewOverlay {...previewData} />}
        </>
    );
};

// Separate component for the preview
const PreviewOverlay = ({ href, rect }: { href: string; rect: DOMRect }) => {
    return (
        <div
            className="fixed z-50 bg-white shadow-lg rounded p-4 max-w-md"
            style={{
                top: `${rect.bottom + 8}px`,
                left: `${rect.left}px`,
            }}
        >
            <ArticlePreview href={href}>
                <Link to={href}>{href}</Link>
            </ArticlePreview>
        </div>
    );
};

export default WikiArticle;
