import { useEffect, useState } from "react";

const WikiArticle = ({ title }: { title: string }) => {
    const [article, setArticle] = useState("");

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

        fetchArticle({ title: title });
    }, []);

    console.log(article);

    if (!article) {
        return <div>Loading...</div>;
    }

    return <div id="article" dangerouslySetInnerHTML={{ __html: article }} />;
};

export default WikiArticle;
