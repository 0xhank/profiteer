import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import rehypeRaw from "rehype-raw";
import { getHeadlineList } from "../../sbClient";
import { cn } from "../../utils/cn";

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

    const [firstSentence, ...restContent] = article.content.split(
        /(?<=[^A-Z][.!?])\s+(?=[A-Z\[])/
    );

    return (
        <div
            className={cn(
                "h-full w-full flex p-2 gap-2 bg-white rounded-sm shadow-md",
                isFeature ? "flex-col" : "flex-row"
            )}
        >
            {article.imageUrl && !showNoImage && (
                <img
                    src={
                        article.imageUrl ||
                        "https://placehold.co/600x400/gray/white?text=No+Image"
                    }
                    className={`object-cover ${
                        isFeature ? "w-48 h-auto self-center" : "w-auto h-24"
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
            <div>
                <ReactMarkdown
                    className={`inline font-semibold ${
                        isFeature ? "text-lg" : "text-base"
                    }`}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        a: ({ children, href, ...props }) => (
                            <Link to={href || "#"} {...props}>
                                {children}
                            </Link>
                        ),
                    }}
                >
                    {firstSentence}
                </ReactMarkdown>
                {restContent.length > 0 && (
                    <ReactMarkdown
                        className={`inline text-sm opacity-70`}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            a: ({ children, href, ...props }) => (
                                <Link to={href || "#"} {...props}>
                                    {children}
                                </Link>
                            ),
                        }}
                    >
                        {restContent.join(" ")}
                    </ReactMarkdown>
                )}
                <span className="inline text-sm text-gray-500">
                    [{formatDate(article.created_at)}]
                </span>
            </div>
        </div>
    );
}
