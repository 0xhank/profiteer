import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/common/page-layout";
import { NewsStories } from "../components/home/news-stories";
import { TokenList } from "../components/home/token-list";
import { cn } from "../utils/cn";
import { getWikipediaAutocomplete } from "../utils/getWikiAutocomplete";

export default function Home() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);



    const handleSearchChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newQuery = event.target.value;
        setQuery(newQuery);

        if (newQuery.length > 2) {
            // Fetch suggestions for queries longer than 2 characters
            const results = await getWikipediaAutocomplete(newQuery);
            // right now the results are an array with /wiki/Donald%20Trump
            // how can i replace the %20 with an underscore?
            const suggestions = results.map((result) =>
                result.replace("%20", "_")
            );
            setSuggestions(suggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        navigate(`/wiki/${suggestion}`);
        setQuery("");
        setSuggestions([]);
    };

    return (
        <PageLayout>
            <div className="flex flex-col animation gap-4 text-center animate-fade-in">
                <h4 className="w-full text-right opacity-70">devnet</h4>
                <h1 className="text-[100pt] -mt-20 -mb-16">
                    <span className="font-serif font-semibold">Profiteer</span>
                </h1>
                <p
                    className={
                        "px-4 text-2xl opacity-70 text-primary font-bold w-full text-left"
                    }
                >
                    Everything is a meme.
                </p>
                <div className="space-y-4 flex flex-col items-center">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearchChange}
                            onBlur={() => {
                                // Small delay to allow suggestion clicks to register
                                setTimeout(() => {
                                    setQuery("");
                                    setSuggestions([]);
                                }, 200);
                            }}
                            placeholder="Search for news..."
                            className="input input-bordered w-full pr-10 text-xl h-14"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <ul
                            className={cn(
                                "absolute text-left bg-white rounded rounded-md w-full z-10 list-none border border-base-300",
                                suggestions.length > 0 ? "block" : "hidden"
                            )}
                            style={{
                                listStyleType: "none",
                                MozMarginStart: "0",
                                marginInlineStart: "0",
                                marginInlineEnd: "0",
                            }}
                        >
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className=" px-8 p-2 bg-base-100 hover:bg-base-300 border-y border-base-300 cursor-pointer"
                                    onClick={() =>
                                        handleSuggestionClick(suggestion)
                                    }
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
              
            </div>
            <div className="grid grid-cols-3 gap-12">
                <div className="col-span-2">
                    <NewsStories /> 
                </div>
                <div className="col-span-1">
                    <TokenList />
                </div>
            </div>
        </PageLayout>
    );
}
