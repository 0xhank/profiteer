import { useEffect, useState } from "react";
import { LoadingPane } from "../common/loading";
import { getArticleList, getImage } from "../../sbClient";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

type Article = {
    article_names: string[] | null;
    content: string;
    created_at: string;
    id: number;
    image_id: string | null;
};

export function LatestNews() {
    const [articles, setArticles] = useState<Article[] | null>(null);

    useEffect(() => {
        
        const fetchArticleList = async () => {
            const articles = await getArticleList();
            setArticles(articles);
        };

        fetchArticleList();
    }, []);

    if (!articles) {
        return <LoadingPane className="h-[600px]" />;
    }

    return <div>
        <h3>Breaking</h3>
        {articles.map((article) => (
            <ul key={article.id}>
                <Article article={article} />
            </ul>
        ))}
    </div>
}

function Article({ article }: { article: Article }) {
    const [image, setImage] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const fetchImage = async () => {
            if (!article.image_id) return;
            const image = await getImage(article.image_id);
            setImage(image);
        };

        fetchImage();
    }, [article.image_id]);


    return <li className="flex flex-row gap-4 items-center justify-start">
        {image && <img 
            src={image }
            className="w-8 h-8 rounded-md" 
            alt={article.article_names?.[0]}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
            }}
        />}
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {`${article.content} <span class="text-sm text-gray-500">[${formatDate(article.created_at)}]</span>`}
        </ReactMarkdown>
    </li>
}