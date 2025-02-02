import { useEffect, useState } from "react";

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

                setArticle(`
                    <h2>In The News</h2>
                    ${newsSection?.innerHTML || "No news available"}
                    <h2>Current Events</h2>
                    ${eventsBlurb.innerHTML}
                `);
            } catch (error) {
                console.error("Error fetching content:", error);
            }
        };

        fetchArticle();
    }, []);

    if (!article) {
        return null;
    }

    return <div dangerouslySetInnerHTML={{ __html: article }} />;
    // ... existing code ...
}
