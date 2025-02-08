import bs58 from "bs58";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PageLayout } from "../components/common/page-layout";
import { CreateToken } from "../components/topic/create-token";
import { TokenContent } from "../components/topic/token-content";
import supabase from "../sbClient";
import { TopicView } from "../components/topic/topic-view";
import {
    checkValidWikiLink,
    cleanWikiArticle,
} from "../utils/cleanWikiArticle";

export default function Topic() {
    const params = useParams();
    const [mint, setMint] = useState<string | null>(null);
    const [articleName, setArticleName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [invalidLink, setInvalidLink] = useState(false);
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
                const decoded = bs58.decode(id);
                return decoded.length === 32; // Solana addresses are 32 bytes
            } catch {
                return false;
            }
        };
        const id = params.id;
        if (!id || !checkValidWikiLink(id)) {
            setInvalidLink(true);
            setArticleName(null);
            setMint(null);
            setLoading(false);
            return;
        }
        if (!isBs58(id)) {
            console.log("getting article name", id);
            try {
                const mint = await getArticleMint(id);
                setArticleName(id);
                setMint(mint?.mint || null);
            } catch {
                toast.error(`Article does not exist`);
                setInvalidLink(true);
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

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <PageLayout>{null}</PageLayout>;
    }
    if (invalidLink || !articleName) {
        return (
            <PageLayout className="flex ">
                <p>This page doesn't exist.</p>
                <button onClick={() => goBack()} className="btn btn-primary">
                    Go back
                </button>
            </PageLayout>
        );
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
                setArticle(cleanWikiArticle(blurb.innerHTML));
            } catch (error) {
                console.error("Error fetching the article:", error);
            }
        };

        fetchArticle({ title: articleName });
    }, []);

    return (
        <PageLayout>
            <div className="w-[1200px] h-full grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-12">
                {/* Wiki Article on the left */}
                <div className="col-span-2 h-full">
                    <TopicView
                        articleName={articleName}
                        articleContent={article}
                    />
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
