import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Disclaimer } from "./components/common/disclaimer";
import ServerStatus from "./components/home/server-status";
import TopBar from "./components/top-bar/top-bar";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { SlotProvider } from "./contexts/SlotContext";
import { SolPriceProvider } from "./contexts/SolPriceContext";
import { TokenProvider } from "./contexts/TokenProvider";
import { Page404 } from "./pages/404";
import Home from "./pages/home";
import Token from "./pages/token";
import { PrivyClientProvider } from "./providers/privy-client-provider";
import { ServerProvider } from "./providers/server-provider";

function App() {
    return (
        <Router>
            <PrivyClientProvider>
                <TokenProvider>
                    <ServerProvider>
                        <SolPriceProvider>
                            <SlotProvider>
                                <PortfolioProvider>
                                    <_App />
                                </PortfolioProvider>
                            </SlotProvider>
                        </SolPriceProvider>
                    </ServerProvider>
                </TokenProvider>
            </PrivyClientProvider>
        </Router>
    );
}

function _App() {
    return (
        <div className="flex flex-col items-center relative h-screen w-screen absolute top-0 left-0 right-0 z-50 bg-base-100">
            <TopBar className="absolute top-0 left-0 right-0 z-50" />
            <div className="flex items-center justify-center overflow-y-auto w-full h-full pt-16">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/wiki/:id" element={<Token />} />
                    <Route path="/*" element={<Page404 />} />
                </Routes>
            </div>
            <Disclaimer />
            <ServerStatus />
        </div>
    );
}

export default App;
