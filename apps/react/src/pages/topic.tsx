import bs58 from "bs58";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LoadingPane } from "../components/common/loading";
import { PageLayout } from "../components/common/page-layout";
import { CreateToken } from "../components/topic/create-token";
import { TopicView } from "../components/topic/topic-view";
import { useToken } from "../hooks/useToken";
import supabase from "../sbClient";
import {
    checkValidWikiLink,
    cleanWikiArticle,
} from "../utils/cleanWikiArticle";
import { linkToName } from "../utils/titleToLink";
import { TokenContent } from "../components/topic/token-content";
import { TokenChart } from "../components/topic/token-chart";
import { cn } from "../utils/cn";
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
        const cleanedArticleName = linkToName(articleName);
        const { data, error } = await supabase
            .from("mint_article_name")
            .select("mint")
            .eq("article_name", cleanedArticleName)
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
        const isBs58 = (id: string) => {
            try {
                const decoded = bs58.decode(id);
                return decoded.length === 32; // Solana addresses are 32 bytes
            } catch {
                return false;
            }
        };
        const link = params.id;
        if (!link || !checkValidWikiLink(link)) {
            setInvalidLink(true);
            setArticleName(null);
            setMint(null);
            setLoading(false);
            return;
        }
        if (!isBs58(link)) {
            try {
                const name = linkToName(link);
                const mint = await getArticleMint(name);
                setArticleName(name);
                setMint(mint?.mint || null);
            } catch {
                toast.error(`Article does not exist`);
                setInvalidLink(true);
            }
        } else {
            setMint(link);
            const articleName = await getArticleName(link);
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
        return (
            <PageLayout>
                <LoadingPane className="h-full w-full" />
            </PageLayout>
        );
    }
    if (invalidLink || !articleName) {
        return (
            <PageLayout>
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-md p-2 gap-4">
                    <p>This page doesn't exist.</p>
                    <button
                        onClick={() => goBack()}
                        className="btn btn-primary"
                    >
                        Go back
                    </button>
                </div>
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
    const { token: tokenData } = useToken(mint ?? "");
    const image = tokenData?.metadata.imageUri;
    const { refreshToken } = useToken(mint ?? "");

    useEffect(() => {
        const fetchArticle = async ({ title }: { title: string }) => {
            setArticle(null);
            try {
                const response = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=${title}&origin=*`
                );
                const data = await response.json();
                const markup = data.parse.text["*"];
                const sanitizedMarkup = DOMPurify.sanitize(markup);
                const blurb = document.createElement("div");
                blurb.innerHTML = sanitizedMarkup;
                setArticle(cleanWikiArticle(blurb.innerHTML));
            } catch (error) {
                console.error("Error fetching the article:", error);
            }
        };

        fetchArticle({ title: articleName });
        if (mint) refreshToken();
    }, [articleName, mint]);

    return (
        <PageLayout className="p-2 ">
            <div
                className="flex gap-4 items-center bg-white rounded-md p-2 max-w-[1100px]"
                style={{ scrollbarGutter: "stable" }}
            >
                {image && (
                    <img
                        src={image}
                        className="max-h-20 w-auto object-contain"
                    />
                )}
                <div className="flex flex-col gap-2 ">
                    <p className="font-serif text-2xl font-bold">
                        {articleName.replace(/_/g, " ")}
                    </p>
                    {mint ? (
                        <input
                            className="cursor-pointer max-w-[410px] border-black/30"
                            value={mint}
                        />
                    ) : (
                        <p></p>
                    )}
                </div>
            </div>
            <div className="max-w-[1100px] h-full grid grid-cols-1 md:grid-cols-3 md:gap-8 items-start w-full py-2">
                {/* Rest of the content */}
                {mint && <TokenContent mint={mint} />}
                {!mint && (
                    <CreateToken
                        articleName={articleName}
                        articleContent={article}
                        refresh={refresh}
                    />
                )}
                {/* Wiki Article on the left */}
                {mint && <TokenChart mint={mint} className="col-span-1 md:col-span-2 w-full h-full" />}
                    {/* <iframe
                        src={`https://dexscreener.com/solana/${mint}?embed=1&theme=light&trades=0&info=0`}
                        height="400px"
                        width="100%"
                /> */}
                <TopicView
                    className={cn("col-span-1", 
                        mint ? "md:col-span-3" : "md:col-span-2",
                    )}
                    articleName={articleName}
                    articleContent={article}
                />
            </div>
        </PageLayout>
    );
}
