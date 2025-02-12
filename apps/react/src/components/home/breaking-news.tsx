import { useEffect, useState } from "react";
import { getHeadlineList } from "../../sbClient";
import { LoadingPane } from "../common/loading";
import { Headline } from "../common/Headline";

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
    if (articles == null) {
        return <LoadingPane className="h-[600px]" />;
    }
    if (articles.length === 0) {
        return <div className="h-[600px] flex items-center justify-center bg-white rounded-md">No articles found</div>;
    }
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 md:grid-cols-3 col-span-3 min-h-96 gap-2">
                <Headline
                    article={featureArticle}
                    isFeature={true}
                    showNoImage={true}
                />
                {featureImage && (
                    <div className="row-span-2 col-span-2 flex justify-center items-center bg-white rounded-md p-1">
                    <img
                        src={featureImage}
                        alt={
                            featureArticle.article_names?.[0] || "Article image"
                        }
                        className="row-span-2 col-span-2 w-full h-auto object-cover"
                    />
                    </div>
                )}
                {secondArticle && (
                    <Headline
                        article={secondArticle}
                        isFeature={true}
                        showNoImage={true}
                    />
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {otherArticles.map((article, index) =>
                   
                        // Rest of the articles - bottom cascade
                        <div key={article.id} className="col-span-1">
                            <Headline article={article} />
                        </div>
                )}
            </div>
        </div>
    );
}