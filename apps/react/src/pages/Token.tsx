import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "../components/page-layout";
import WikiArticle from "../components/wiki-article";
import bs58 from "bs58";
import { useEffect, useState } from "react";
import { useServer } from "../hooks/useServer";
import { TokenContent } from "../components/token/token-content";
import { CreateToken } from "../components/token/create-token";

export default function Token() {
    const params = useParams();
    console.log(params);
    const [mint, setMint] = useState<string | null>(null);
    const [articleName, setArticleName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { getMintFromArticleName, getArticleNameFromMint } = useServer();

    useEffect(() => {
        setLoading(true);
        const isBs58 = (id: string) => {
            try {
                bs58.decode(id);
                return true;
            } catch {
                return false;
            }
        };
        const setIdAndName = async () => {
            const id = params.id;
            console.log(id);
            if (!id) {
                navigate("/404");
                return;
            }
            if (!isBs58(id)) {
                const mint = await getMintFromArticleName.query({
                    articleName: id,
                });
                setArticleName(id);
                setMint(mint?.mint || null);
            } else {
                const articleName = await getArticleNameFromMint.query({
                    mint: id,
                });
                setMint(id);
                setArticleName(articleName?.article_name || null);
            }
            setLoading(false);
        };
        setIdAndName();
    }, [params]);

    console.log(mint, articleName);
    if (loading) {
        return <PageLayout>Loading...</PageLayout>;
    }
    if (!params.id || !articleName) {
        return <Navigate to="/404" replace />;
    }
    return <PageContent mint={mint} articleName={articleName} />;
}

function PageContent({
    mint,
    articleName,
}: {
    mint: string | null;
    articleName: string;
}) {
    const [article, setArticle] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async ({ title }: { title: string }) => {
            try {
                const response = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=${title}&origin=*`
                );
                const data = await response.json();
                const markup = data.parse.text["*"];
                const blurb = document.createElement("div");
                blurb.innerHTML = markup;
                setArticle(blurb.innerHTML);
            } catch (error) {
                console.error("Error fetching the article:", error);
            }
        };

        fetchArticle({ title: articleName });
    }, []);
    // if (!tokenData) {
    //     return <PageLayout>Token not found</PageLayout>;
    // }
    if (!article) {
        return <PageLayout>Loading...</PageLayout>;
    }
    return (
        <PageLayout>
            <div className="max-w-[1200px] h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-12">
                {/* Wiki Article on the left */}
                <div className="col-span-1 overflow-y-auto h-full">
                    <WikiArticle articleHtml={article} />
                </div>
                {/* Rest of the content */}
                {mint && <TokenContent mint={mint} />}
                {!mint && <CreateToken articleName={articleName} articleContent={article} />}
            </div>
        </PageLayout>
    );
}
