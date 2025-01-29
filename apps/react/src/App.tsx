import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Token from "./pages/token";
import Home from "./pages/home";
import TopBar from "./components/top-bar/top-bar";
import { TokenListProvider } from "./contexts/UserListContext";
import { SolanaPriceProvider } from "./contexts/SolanaPriceContext";
import { WalletBalanceProvider } from "./contexts/WalletBalanceContext";
import { TokenProvider } from "./contexts/TokenContext";
import { Disclaimer } from "./components/disclaimer";
import { PrivyClientProvider } from "./providers/privy-client-provider";
import { trpc } from "./utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4000/trpc',

        }),
      ],
      
});
function App() {
  return (
      <trpc.Provider
        queryClient={queryClient}
        client={trpcClient}
      >
      <QueryClientProvider client={queryClient}>

        <PrivyClientProvider>
          <SolanaPriceProvider>
            <WalletBalanceProvider>
              <TokenListProvider>
                <TokenProvider>
                  <_App />
                </TokenProvider>
              </TokenListProvider>
            </WalletBalanceProvider>
          </SolanaPriceProvider>
        </PrivyClientProvider>
      </QueryClientProvider>
      </trpc.Provider>
  );
}
function _App() {
  return (
    <Router>
      <div className="relative flex flex-col h-screen w-screen absolute top-0 left-0 right-0 z-50">
        <TopBar className="absolute top-0 left-0 right-0 z-50" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/token/:tokenId" element={<Token />} />
        </Routes>
        <Disclaimer className="absolute bottom-0 left-0 right-0 z-50" />
      </div>
    </Router>
  );
}

export default App;
