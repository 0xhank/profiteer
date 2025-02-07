
export async function getWikipediaAutocomplete(
    query: string
): Promise<string[]> {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        query
    )}&limit=10&namespace=0&format=json&origin=*`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data[1];
    } catch (error) {
        console.error("Error fetching Wikipedia autocomplete:", error);
        return [];
    }
}
