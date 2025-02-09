import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cn } from "../../utils/cn";
import { ArticlePreview } from "../common/article-preview";
import { LoadingPane } from "../common/loading";

export function YesterdayNews() {
    const [article, setArticle] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<{
        href: string;
        rect: DOMRect;
    } | null>(null);

    const handleMouseEnter = (e: MouseEvent) => {
        const link = e.target as HTMLAnchorElement;
        if (link.tagName === "A" && link.href.includes("/wiki/")) {
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
        const newsContainer = document.getElementById("yesterday-news");
        newsContainer?.addEventListener("mouseover", handleMouseEnter);
        newsContainer?.addEventListener("mouseout", handleMouseLeave);

        return () => {
            newsContainer?.removeEventListener("mouseover", handleMouseEnter);
            newsContainer?.removeEventListener("mouseout", handleMouseLeave);
        };
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                // First try to get current events
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const months = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];
                const formattedDate = `${yesterday.getFullYear()}_${
                    months[yesterday.getMonth()]
                }_${yesterday.getDate()}`;
                const eventsUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=Portal%3ACurrent%20events%2F${formattedDate}&formatversion=2&rvprop=content&rvparse=1&origin=*`;

                // Fetch both in parallel
                const eventsResponse = await fetch(eventsUrl);

                const eventsData = await eventsResponse.json();

                const eventsMarkup =
                    eventsData.query.pages[0].revisions[0].content;

                const eventsBlurb = document.createElement("div");

                eventsBlurb.innerHTML = eventsMarkup;

                // Remove links around images but keep the images
                eventsBlurb.querySelectorAll("a > img").forEach((img) => {
                    const link = img.parentElement;
                    if (link?.tagName === "A") {
                        link.replaceWith(img);
                    }
                });

                // Convert Portal links to divs
                eventsBlurb
                    .querySelectorAll('a[href^="/wiki/Portal:"]')
                    .forEach((link) => {
                        const div = document.createElement("span");
                        div.innerHTML = link.innerHTML;
                        link.replaceWith(div);
                    });

                setArticle(eventsBlurb.innerHTML);
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred";
                toast.error(`Error fetching news content: ${errorMessage}`);
                console.error("Error fetching news content:", error);
            }
        };

        fetchArticle();
    }, []);

    if (!article) {
        return <LoadingPane className="h-[600px]" />;
    }

    return (
        <>
            <div>
                <h3 className="text-lg font-bold">
                    Yesterday's{" "}
                    <span
                        className={cn(
                            "text-xl font-bold font-script !text-accent",
                            "text-shadow-[2px_2px_0_black,_-2px_-2px_0_black,_2px_-2px_0_black,_-2px_2px_0_black]"
                        )}
                    >
                        News
                    </span>
                </h3>
                <div
                    id="yesterday-news"
                    dangerouslySetInnerHTML={{ __html: article }}
                />
            </div>
            {previewData && <PreviewOverlay {...previewData} />}
        </>
    );
}

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
                <a href={href}>{href}</a>
            </ArticlePreview>
        </div>
    );
};
