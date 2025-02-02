"use client";

import { useNavigate } from "react-router-dom";
// import { usePrivy } from "@privy-io/react-auth";
// import { useSolanaWallets } from "@privy-io/react-auth/solana";
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
                    <button
                        className="btn btn-accent btn-xl text-slate-950 z-50"
                        onClick={() => navigate("/create")}
                    >
                        Create Token
                    </button>
                </div>
            </div>
            <TokenList />
        </PageLayout>
    );
}
