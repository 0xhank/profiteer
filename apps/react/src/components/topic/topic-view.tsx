import { useState } from "react";
import { TopicNews } from "./topic-news";
import WikiArticle from "./wiki-article";

type Tab = "news" | "wiki";

export const TopicView = ({
    articleName,
    articleContent,
}: {
    articleName: string;
    articleContent: string | null;
}) => {
    const [activeTab, setActiveTab] = useState<Tab>("news");

    return (
        <div className="w-full">
            <div className="flex border-b border-black/30">
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

            <div className="mt-4">
                {activeTab === "news" && <TopicNews />}
                {activeTab === "wiki" && articleContent && (
                    <WikiArticle articleHtml={articleContent} />
                )}
            </div>
        </div>
    );
};
