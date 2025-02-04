import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "../components/common/page-layout";
import WikiArticle from "../components/token/wiki-article";
import bs58 from "bs58";
import { useEffect, useState } from "react";
import { TokenContent } from "../components/token/token-content";
import { CreateToken } from "../components/token/create-token";
import supabase from "../sbClient";

export default function Token() {
    const params = useParams();
    const [mint, setMint] = useState<string | null>(null);
    const [articleName, setArticleName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getArticleName = async (mint: string) => {
        const { data, error } = await supabase
            .from("mint_article_name")
            .select("article_name")
            .eq("mint", mint)
            .limit(1);

        if (error) {
            throw new Error(`Failed to fetch article token: ${error.message}`);
        }
        if (data.length === 0) {
            return null;
        }
        return data[0];
    };

    const getArticleMint = async (articleName: string) => {
        const { data, error } = await supabase
            .from("mint_article_name")
            .select("mint")
            .eq("article_name", articleName)
            .limit(1);

        if (error) {
            throw new Error(`Failed to fetch article token: ${error.message}`);
        }
        return data[0];
    };
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
                const mint = await getArticleMint(id);
                setArticleName(id);
                setMint(mint?.mint || null);
            } else {
                const articleName = await getArticleName(id);
                setMint(id);
                setArticleName(articleName?.article_name || null);
            }
            setLoading(false);
        };
        setIdAndName();
    }, [params]);

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

    return (
        <PageLayout>
            <div className="max-w-[1200px] h-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
                {/* Wiki Article on the left */}
                <div className="col-span-2 overflow-y-auto h-full">
                    {article && <WikiArticle articleHtml={article} />}
                    {!article && <div>Loading...</div>}
                </div>
                {/* Rest of the content */}
                {mint && <TokenContent mint={mint} />}
                {!mint && (
                    <CreateToken
                        articleName={articleName}
                        articleContent={article}
                    />
                )}
            </div>
        </PageLayout>
    );
}