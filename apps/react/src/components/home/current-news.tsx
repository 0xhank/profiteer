import { useEffect, useState } from "react";
import { LoadingPane } from "../common/loading";
import { toast } from "react-toastify";

export function CurrentNews() {
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

                    // Convert Portal links to divs
                    eventsBlurb.querySelectorAll('a[href^="/wiki/Portal:"]').forEach((link) => {
                        const div = document.createElement("span");
                        div.innerHTML = link.innerHTML;
                        link.replaceWith(div);
                    });

                    setArticle(eventsBlurb.innerHTML);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                toast.error(`Error fetching news content: ${errorMessage}`);
                console.error("Error fetching news content:", error);
            }
        };

        fetchArticle();
    }, []);

    if (!article) {
        return <LoadingPane className="h-[600px]" />;
    }

    return <div>
        <h3 className="text-lg font-bold">Yesterday</h3>
        <div dangerouslySetInnerHTML={{ __html: article }} />
    </div>;
}