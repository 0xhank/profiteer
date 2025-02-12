import { useEffect, useState } from "react";
import { TopicNews } from "./topic-news";
import { LoadingPane } from "../common/loading";
import { getRelatedHeadlines } from "../../sbClient";
type Tab = "news" | "wiki";

export const TopicView = ({
    articleName,
    articleContent,
}: {
    articleName: string;
    articleContent: string | null;
}) => {
    const [activeTab, setActiveTab] = useState<Tab>("wiki");
    const [articles, setArticles] = useState<Awaited<ReturnType<typeof getRelatedHeadlines>> | null>(null);

    useEffect(() => {
        const fetchArticleList = async () => {
            const articles = await getRelatedHeadlines([articleName]);
            setArticles(articles);
        };

        fetchArticleList();
    }, []);



    return (
        <div className="w-full">
            <div className="flex border-b border-black/30 bg-white rounded-sm w-full">
                <button
                    className={`cursor-pointer px-4 py-2 ${
                        activeTab === "news"
                            ? "border-b-2 border-accent text-accent"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("news")}
                >
                    News
                </button>
                <button
                    className={`cursor-pointer px-4 py-2 ${
                        activeTab === "wiki"
                            ? "border-b-2 border-accent text-accent"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("wiki")}
                >
                    Wiki
                </button>
            </div>

            <div className="mt-2 bg-white rounded-sm p-4 w-full">
                {activeTab === "news" && <TopicNews articles={articles} />}
                {activeTab === "wiki" &&
                    (articleContent ? (
                        <div
                            id="article"
                            className="w-full"
                            dangerouslySetInnerHTML={{
                                __html: articleContent,
                            }}
                        />
                    ) : (
                        <LoadingPane className="h-full w-full" />
                    ))}
            </div>
        </div>
    );
};
