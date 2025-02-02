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
                const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=Portal%3ACurrent%20events%2F${formattedDate}&formatversion=2&rvprop=content&rvparse=1&origin=*`;
                // const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=Portal:Current_events/${formattedDate}&prop=text&origin=*`;
                const newsResponse = await fetch(url);
                const newsData = await newsResponse.json();
                const newsMarkup = newsData.query.pages[0].revisions[0].content;
                const newsBlurb = document.createElement("div");
                newsBlurb.innerHTML = newsMarkup;

                // Combine both pieces of content
                setArticle(`
                        ${newsBlurb.innerHTML}
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
