import { convertHtmlToReact } from "@hedgedoc/html-to-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRelatedHeadlines } from "../../sbClient";
import { LoadingPane } from "../common/loading";
import { TopicNews } from "./topic-news";
import { Node } from "domhandler";
type Tab = "news" | "wiki";

export const TopicView = ({
    articleName,
    articleContent,
}: {
    articleName: string;
    articleContent: string | null;
}) => {
    const [activeTab, setActiveTab] = useState<Tab>("wiki");
    const [articles, setArticles] = useState<Awaited<
        ReturnType<typeof getRelatedHeadlines>
    > | null>(null);

    useEffect(() => {
        const fetchArticleList = async () => {
            console.log({articleName});
            const articles = await getRelatedHeadlines([articleName]);
            setArticles(articles);
        };

        fetchArticleList();
    }, [articleName]);

    const transform = (node: Node, index: string | number) => {
        if (
            node.type === "tag" &&
            node.name === "a" &&
            node.attribs?.href?.startsWith("/wiki/")
        ) {
            const to = node.attribs.href;
            return (
                <Link
                    key={index}
                    to={to}
                    className="text-blue-600 hover:text-blue-800"
                >
                    {convertHtmlToReact(node.children[0].data)}
                </Link>
            );
        }
    };

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
                        <div className="prose max-w-none bg-white rounded-md p-4">
                            {convertHtmlToReact(articleContent, {transform})}
                        </div>
                    ) : (
                        <LoadingPane className="h-full w-full" />
                    ))}
            </div>
        </div>
    );
};
