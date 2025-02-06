import bs58 from "bs58";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { LoadingPane } from "../components/common/loading";
import { PageLayout } from "../components/common/page-layout";
import { CreateToken } from "../components/token/create-token";
import { TokenContent } from "../components/token/token-content";
import WikiArticle from "../components/token/wiki-article";
import supabase from "../sbClient";
import { toast } from "react-toastify";

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
            toast.error(`Article does not exist`);
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
            console.error(error);
            return null;
        }
        if (data.length === 0) {
            console.error("No data found");
            return null;
        }
        return data[0];
    };

    const refresh = async () => {
        setLoading(true);
        const isBs58 = (id: string) => {
            try {
                bs58.decode(id);
                return true;
            } catch {
                return false;
            }
        };
        const id = params.id;
        if (!id) {
            navigate("/404");
            return;
        }
        if (!isBs58(id)) {
            try {
            const mint = await getArticleMint(id);
            setArticleName(id);
            setMint(mint?.mint || null);
            } catch {
                toast.error(`Article does not exist`);
                navigate("/404");
            }
        } else {
            setMint(id);
            const articleName = await getArticleName(id);
            setArticleName(articleName?.article_name || null);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!params) return;
        refresh();
    }, [params]);

    if (loading) {
        return <PageLayout>{null}</PageLayout>;
    }
    if (!params.id || !articleName) {
        return <Navigate to="/404" replace />;
    }
    return (
        <PageContent mint={mint} articleName={articleName} refresh={refresh} />
    );
}

function PageContent({
    mint,
    articleName,
    refresh,
}: {
    mint: string | null;
    articleName: string;
    refresh: () => void;
}) {
    const [article, setArticle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async ({ title }: { title: string }) => {
            try {
                setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle({ title: articleName });
    }, []);

    return (
        <PageLayout>
            <div className="w-[1200px] h-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
                {/* Wiki Article on the left */}
                <div className="col-span-2 h-full"> 
                    {article && !isLoading && (
                        <WikiArticle articleHtml={article} />
                    )}
                    {isLoading && <LoadingPane className="h-[600px]" />}
                </div>
                {/* Rest of the content */}
                {mint && <TokenContent mint={mint} />}
                {!mint && (
                    <CreateToken
                        articleName={articleName}
                        articleContent={article}
                        refresh={refresh}
                    />
                )}
            </div>
        </PageLayout>
    );
}
