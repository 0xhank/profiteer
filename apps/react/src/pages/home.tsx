"use client";

import { useNavigate } from "react-router-dom";
// import { usePrivy } from "@privy-io/react-auth";
// import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useState } from "react";
import { PageLayout } from "../components/page-layout";
import { TokenList } from "../components/token-list";

export default function Home() {
    // const { login, ready, authenticated, user } = usePrivy();
    // const { createWallet, wallets } = useSolanaWallets();

    // useEffect(() => {
    //   const createWalletAndUser = async () => {
    //     if (
    //       authenticated &&
    //       ready &&
    //       wallets.length === 0 &&
    //       user?.twitter?.username
    //     ) {
    //       try {
    //         const wallet = await createWallet();
    //         await createUser(wallet.address, user.twitter.username);
    //       } catch (error) {
    //         if (
    //           !(error instanceof Error) ||
    //           !error.message.includes("already has")
    //         ) {
    //           console.error("Failed to create Solana wallet or user:", error);
    //         }
    //       }
    //     }
    //   };

    //   createWalletAndUser();
    // }, [authenticated, ready, wallets, createWallet, user?.twitter?.username]);

    // const handleCreateToken = async () => {
    //   if (!authenticated) {
    //     try {
    //       await login();
    //     } catch (error) {
    //       console.error("Login failed:", error);
    //     }
    //   } else {
    //     if (!isLoading && hasToken && twitterUsername) {
    //       navigate(`/token/${twitterUsername}`);
    //     } else {
    //       navigate("/create");
    //     }
    //   }
    // };

    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    async function getWikipediaAutocomplete(query: string) {
        const endpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
            query
        )}&limit=10&namespace=0&format=json&origin=*`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            return data[1]; // The second element contains the list of suggestions
        } catch (error) {
            console.error("Error fetching Wikipedia autocomplete:", error);
            return [];
        }
    }

    const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setQuery(newQuery);

        if (newQuery.length > 2) {
            // Fetch suggestions for queries longer than 2 characters
            const results = await getWikipediaAutocomplete(newQuery);
            setSuggestions(results);
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
            <div className="flex flex-col text-left animate-fade-in">
                <h1 className="text-[100pt]">
                    <span className="font-serif">news</span>
                    <span className="font-script text-accent">.fun</span>
                </h1>
                <div className="flex justify-between flex-col md:flex-row text-primary">
                    <div className="flex flex-col">
                        <p
                            className={
                                "text-4xl opacity-70 dark:text-gray-300 white font-bold [filter:contrast(150%)_brightness(110%)_url(#noise)]"
                            }
                        >
                            Trade the news. Meme the news.
                        </p>
                    </div>
                </div>
                <div className="space-y-4 flex flex-col items-center">
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearchChange}
                            placeholder="Search for news..."
                            className="input input-bordered w-full"
                        />
                        <ul className="absolute bg-white border border-gray-300 w-full list-disc z-10">
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
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
            <TokenList />
        </PageLayout>
    );
}
