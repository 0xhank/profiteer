import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/common/page-layout";
import { BreakingNews } from "../components/home/breaking-news";
import { TokenList } from "../components/home/token-list";
import { YesterdayNews } from "../components/home/yesterday-news";
import { cn } from "../utils/cn";
import { getWikipediaAutocomplete } from "../utils/getWikiAutocomplete";

export default function Home() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Add ref for the input
    const inputRef = useRef<HTMLInputElement>(null);

    // Add useEffect to focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

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
                <div className="space-y-4 flex flex-col items-center">
                    <TokenList />
                    <div className="relative max-w-md">
                        <input
                            ref={inputRef}
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
                            placeholder="Search"
                            className="input focus:outline-none focus:scale-105 rounded-none bg-slate-100 w-full min-w-96 pr-10 text-lg h-14"
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
                                    className=" px-8 p-2 hover:bg-base-300 border-y border-base-300 cursor-pointer"
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
            <div className="grid grid-cols-3 gap-6 pt-2 border-t-4 border-double border-black">
                <div className="col-span-2 space-y-4">
                    <BreakingNews />
                </div>
                <div className="col-span-1 space-y-4">
                    <YesterdayNews />
                </div>
            </div>
        </PageLayout>
    );
}
