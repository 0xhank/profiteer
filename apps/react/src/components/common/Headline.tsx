import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { cn } from "../../utils/cn";
import { getHeadlineList } from "../../sbClient";
import { Link } from "react-router-dom";

export function Headline({
    article,
    isFeature,
    showNoImage = false,
}: {
    article: Awaited<ReturnType<typeof getHeadlineList>>[number];
    isFeature?: boolean;
    showNoImage?: boolean;
}) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className={cn("flex gap-2 h-full w-full p-2 bg-white rounded-sm shadow-md")}>
            {(article.imageUrl || isFeature) && !showNoImage && (
                <img
                    src={
                        article.imageUrl ||
                        "https://placehold.co/600x400/gray/white?text=No+Image"
                    }
                    className={`object-cover ${
                        isFeature ? "w-full h-48" : "w-24 h-24"
                    }`}
                    alt={article.article_names?.[0] || "Article image"}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src =
                            "https://placehold.co/600x400/gray/white?text=No+Image";
                    }}
                />
            )}
            <ReactMarkdown
                className={`${isFeature ? "text-lg" : "text-base"}`}
                rehypePlugins={[rehypeRaw]}
                components={{
                    a: ({ children, href, ...props }) => (
                        <Link to={href || "#"} {...props}>
                            {children}
                        </Link>
                    ),
                }}
            >
                {`${
                    article.content
                } <span class="text-sm text-gray-500">[${formatDate(
                    article.created_at
                )}]</span>`}
            </ReactMarkdown>
        </div>
    );
}