import { useEffect, useState } from "react";

export function NewsStories() {
    const [article, setArticle] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                // First try to get current events
                const newsResponse = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=Portal:Current_events&prop=text&origin=*`
                );
                const newsData = await newsResponse.json();
                const newsMarkup = newsData.parse.text["*"];
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