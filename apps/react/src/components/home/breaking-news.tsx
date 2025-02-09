import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { getHeadlineList } from "../../sbClient";
import { cn } from "../../utils/cn";
import { LoadingPane } from "../common/loading";

type Article = {
    article_names: string[] | null;
    content: string;
    created_at: string;
    id: number;
    image_id: string | null;
    imageUrl: string | null;
};

export function BreakingNews() {
    const [articles, setArticles] = useState<Article[] | null>(null);

    useEffect(() => {
        const fetchArticleList = async () => {
            const articles = await getHeadlineList();
            setArticles(articles);
        };

        fetchArticleList();
    }, []);

    if (!articles) {
        return <LoadingPane className="h-[600px]" />;
    }

    const featureArticle = articles[0];
    const secondArticle = articles[1];
    const otherArticles = articles.slice(2);
    const featureImage = articles.find((article) => article.imageUrl)?.imageUrl;
    return (
        <div className="flex flex-col">
            <h3 className="text-xl font-bold">
                Breaking{" "}
                <span
                    className={cn(
                        "text-xl font-bold font-script !text-accent",
                        "text-shadow-[2px_2px_0_black,_-2px_-2px_0_black,_2px_-2px_0_black,_-2px_2px_0_black]"
                    )}
                >
                    News
                </span>
            </h3>

            <div className="grid grid-cols-3 col-span-3 min-h-96 divide-y divide-black/30">
                <Article
                    article={featureArticle}
                    isFeature={true}
                    showNoImage={true}
                />
                {featureImage && (
                    <img
                        src={featureImage}
                        alt={
                            featureArticle.article_names?.[0] || "Article image"
                        }
                        className="row-span-2 col-span-2 w-full h-full object-cover"
                    />
                )}
                {secondArticle && (
                    <Article
                        article={secondArticle}
                        isFeature={true}
                        showNoImage={true}
                    />
                )}
            </div>
            <div className="grid grid-cols-2 divide-y divide-black/30">
                {otherArticles.map((article, index) =>
                    index === 0 ? (
                        // First article - large, top right
                        <div key={article.id} className="">
                            <Article
                                article={article}
                                isFeature={true}
                                showNoImage={true}
                            />
                        </div>
                    ) : index <= 2 ? (
                        // Second and third articles - left side
                        <div key={article.id} className="col-span-1 row-span-1">
                            <Article article={article} />
                        </div>
                    ) : (
                        // Rest of the articles - bottom cascade
                        <div key={article.id} className="col-span-1">
                            <Article article={article} />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function Article({
    article,
    isFeature,
    showNoImage = false,
}: {
    article: Article;
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
        <div className={cn("flex gap-2 h-full w-full p-2")}>
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
                        <a href={href || "#"} {...props}>
                            {children}
                        </a>
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
