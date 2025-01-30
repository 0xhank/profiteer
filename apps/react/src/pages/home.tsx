"use client";

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

  return (
    <PageLayout>
      <div className="flex flex-col text-left mt-24 animate-fade-in">
        <h1
          className={
            "text-[100pt] lg:text-[150pt] xl:text-[190pt] -my-12 lg:-my-16 xl:-my-20 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text p-3 text-transparent overflow-visible whitespace-nowrap [text-shadow:_1px_1px_rgba(0,0,0,0.1),_2px_2px_rgba(0,0,0,0.1),_3px_3px_rgba(0,0,0,0.1),_4px_4px_rgba(0,0,0,0.1),_5px_5px_rgba(0,0,0,0.1)] [filter:contrast(150%)_brightness(110%)_url(#noise)]"
          }
        >
          news.fun
        </h1>
        <div className="flex justify-between flex-col md:flex-row">
          <div className="flex flex-col">
            <p
              className={
                "text-2xl text-gray-300 opacity-70 dark:text-pink-400 font-medium [filter:contrast(150%)_brightness(110%)_url(#noise)]"
              }
            >
              ミームコインを立ち上げて金持ちになりたい
            </p>
            <p
              className={
                "text-4xl opacity-70 dark:text-gray-300 white font-bold [filter:contrast(150%)_brightness(110%)_url(#noise)]"
              }
            >
              Meme the news
            </p>
          </div>
          <div className="space-y-4 flex flex-col items-center"></div>
        </div>
      </div>
      <TokenList />
    </PageLayout>
  );
}
