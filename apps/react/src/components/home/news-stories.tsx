import { useEffect, useState } from "react";
import { LoadingPane } from "../common/loading";
import { toast } from "react-toastify";
export function NewsStories() {
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
                const newsUrl = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=Main_Page&prop=text&section=0&origin=*`;

                // Fetch both in parallel
                const [eventsResponse, newsResponse] = await Promise.all([
                    fetch(eventsUrl),
                    fetch(newsUrl),
                ]);

                const [eventsData, newsData] = await Promise.all([
                    eventsResponse.json(),
                    newsResponse.json(),
                ]);

                const eventsMarkup =
                    eventsData.query.pages[0].revisions[0].content;
                const newsMarkup = newsData.parse.text["*"];

                const eventsBlurb = document.createElement("div");
                const newsBlurb = document.createElement("div");

                eventsBlurb.innerHTML = eventsMarkup;
                newsBlurb.innerHTML = newsMarkup;

                const newsSection = newsBlurb.querySelector("#mp-itn");

                // Remove links around images but keep the images
                [eventsBlurb, newsBlurb].forEach((element) => {
                    element.querySelectorAll("a > img").forEach((img) => {
                        const link = img.parentElement;
                        if (link?.tagName === "A") {
                            link.replaceWith(img);
                        }
                    });

                    // Convert Portal links to divs
                    element
                        .querySelectorAll('a[href^="/wiki/Portal:"]')
                        .forEach((link) => {
                            const div = document.createElement("span");
                            div.innerHTML = link.innerHTML;
                            link.replaceWith(div);
                        });
                });

                setArticle(`
                    <h2>In The News</h2>
                    ${newsSection?.innerHTML || "No news available"}
                    <h2>Current Events</h2>
                    ${eventsBlurb.innerHTML}
                `);
            } catch (error) {
                toast.error("Error fetching content:");
                console.error("Error fetching content:", error);
            }
        };

        fetchArticle();
    }, []);

    if (!article) {
        return <LoadingPane className="h-[600px]" />;
    }

    return <div dangerouslySetInnerHTML={{ __html: article }} />;
    // ... existing code ...
}
