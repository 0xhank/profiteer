import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { getWikipediaAutocomplete } from "../../utils/getWikiAutocomplete";
import { nameToLink } from "../../utils/titleToLink";

export function SearchBar({
    focusOnMount = false,
    secondary = false,
}: {
    focusOnMount?: boolean;
    secondary?: boolean;
}) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

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
                result.replace("%20", " ")
            );
            setSuggestions(suggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        navigate(`/wiki/${nameToLink(suggestion)}`);
        setQuery("");
        setSuggestions([]);
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleSearchChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false);
                    setTimeout(() => {
                        setQuery("");
                        setSuggestions([]);
                    }, 200);
                }}
                placeholder=""
                className={cn(
                    "input focus:outline-none rounded-none bg-gray-100 pr-10 pl-8 text-lg h-14 transition-all duration-200",
                    secondary
                        ? "bg-transparent border-none text-white"
                        : "bg-gray-100",
                    isFocused ? "w-48" : "w-8"
                )}
            />
            <div className="absolute inset-y-0 left-2 flex items-center py-3 pointer-events-none" onClick={() => setIsFocused(!isFocused)}>
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
                    "absolute text-left bg-white w-full z-10 list-none border border-gray-300",
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
                        className="px-8 p-2 hover:bg-gray-100 border-y border-gray-300 cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </li>
                ))}
            </ul>
        </div>
    );
}
