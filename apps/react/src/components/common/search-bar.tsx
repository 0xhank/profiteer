import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { getWikipediaAutocomplete } from "../../utils/getWikiAutocomplete";

export function SearchBar({ focusOnMount = false, secondary = false }: { focusOnMount?: boolean, secondary?: boolean }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (focusOnMount) {
            inputRef.current?.focus();
        }
    }, [focusOnMount]);

    const handleSearchChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newQuery = event.target.value;
        setQuery(newQuery);

        if (newQuery.length > 2) {
            const results = await getWikipediaAutocomplete(newQuery);
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
        <div className="relative max-w-md">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleSearchChange}
                onBlur={() => {
                    setTimeout(() => {
                        setQuery("");
                        setSuggestions([]);
                    }, 200);
                }}
                placeholder=""
                className={cn(
                    "input focus:outline-none rounded-none bg-gray-100 w-full min-w-48 pr-10 pl-8 text-lg h-14",
                    secondary ? "bg-transparent border-none text-white" : "bg-gray-100"
                )}
            />
            <div className="absolute inset-y-0 left-2 flex items-center py-3 pointer-events-none">
                <svg
                    className={cn(
                        "w-5 h-5 text-gray-400",
                        secondary ? "text-white" : "text-gray-400"
                    )}
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
                    "absolute text-left bg-white w-full z-10 list-none",
                    secondary ? "border-none" : "bg-white"
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
                        className="px-8 p-2 hover:bg-base-300 border-y border-base-300 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </li>
                ))}
            </ul>
        </div>
    );
}