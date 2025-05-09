import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { cleanWikiArticle } from "../../utils/cleanWikiArticle";
import { LoadingPane } from "../common/loading";
import { Link } from "react-router-dom";
import { convertHtmlToReact } from "@hedgedoc/html-to-react";
import DOMPurify from "dompurify";
import { Node } from "domhandler";

export function YesterdayNews() {
    const [article, setArticle] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                // First try to get current events
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const months = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];
                const formattedDate = `${yesterday.getFullYear()}_${
                    months[yesterday.getMonth()]
                }_${yesterday.getDate()}`;
                const eventsUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=Portal%3ACurrent%20events%2F${formattedDate}&formatversion=2&rvprop=content&rvparse=1&origin=*`;

                // Fetch both in parallel
                const eventsResponse = await fetch(eventsUrl);

                const eventsData = await eventsResponse.json();

                const eventsMarkup =
                    eventsData.query.pages[0].revisions[0].content;

                const eventsBlurb = document.createElement("div");

                eventsBlurb.innerHTML = eventsMarkup;

                // Remove links around images but keep the images
                eventsBlurb.querySelectorAll("a > img").forEach((img) => {
                    const link = img.parentElement;
                    if (link?.tagName === "A") {
                        link.replaceWith(img);
                    }
                });

                setArticle(cleanWikiArticle(eventsBlurb.innerHTML));
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred";
                toast.error(`Error fetching news content: ${errorMessage}`);
                console.error("Error fetching news content:", error);
            }
        };

        fetchArticle();
    }, []);

    useEffect(() => {
        document
            .querySelectorAll('span[data-internal-link="true"]')
            .forEach((span) => {
                const to = span.getAttribute("data-to");
                if (to) {
                    const link = document.createElement("a");
                    link.href = `/wiki/${to}`;
                    link.innerHTML = span.innerHTML;
                    span.replaceWith(link);
                }
            });
    }, [article]);

    const transform = (node: Node, index: string | number) => {
        // Convert internal wiki links to React Router Links
        if (
            node.type === "tag" &&
            node.name === "a" &&
            node.attribs?.href?.startsWith("/wiki/")
        ) {
            const to = node.attribs.href;
            return (
                <Link
                    key={index}
                    to={to}
                    className="text-blue-600 hover:text-blue-800"
                >
                    {convertHtmlToReact(node.children[0].data)}
                </Link>
            );
        }
    };
    if (!article) {
        return <LoadingPane className="h-[600px]" />;
    }

    return (
        <>
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase font-bold w-full">
                    Yesterday
                </p>
                {convertHtmlToReact(DOMPurify.sanitize(article), {
                    transform,
                })}
            </div>
        </>
    );
}
