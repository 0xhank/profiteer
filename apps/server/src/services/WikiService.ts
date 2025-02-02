export const WikiService = () => {
    const getWikiPage = async (page: string) => {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${page}`);
        return response.json();
    }

    return {
        getWikiPage
    }
}

