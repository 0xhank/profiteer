import { getRelatedHeadlines } from "../../sbClient";
import { LoadingPane } from "../common/loading";
import { Headline } from "../common/Headline";

export const TopicNews = ({ articles }: { articles: Awaited<ReturnType<typeof getRelatedHeadlines>> | null }) => {
    if (!articles) {
        return <LoadingPane className="h-[600px]" />;
    }
    if (articles.length === 0) {
        return <div className="h-[600px] flex items-center justify-center">No articles found</div>;
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
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