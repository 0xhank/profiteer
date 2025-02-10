import { useState, useEffect } from "react";
import { getRelatedHeadlines } from "../../sbClient";
import { LoadingPane } from "../common/loading";
import { Headline } from "../common/Headline";

export const TopicNews = ({ topic }: { topic: string }) => {
    const [articles, setArticles] = useState<Awaited<ReturnType<typeof getRelatedHeadlines>> | null>(null);

    useEffect(() => {
        const fetchArticleList = async () => {
            const articles = await getRelatedHeadlines([topic]);
            setArticles(articles);
        };

        fetchArticleList();
    }, []);

    if (!articles) {
        return <LoadingPane className="h-[600px]" />;
    }
    
    return (
        <div className="grid grid-cols-2 gap-4 p-2">
            {articles.map((article, index) => (
                <>
                    <Headline key={article.id} article={article} />
                    {index % 2 === 1 && index < articles.length - 2 && (
                        <hr className="col-span-2 my-4 border-gray-200" />
                    )}
                </>
            ))}
        </div>
    );
};