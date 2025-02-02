import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Disclaimer } from "./components/disclaimer";
import ServerStatus from "./components/server-status";
import TopBar from "./components/top-bar/top-bar";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { SolPriceProvider } from "./contexts/SolPriceContext";
import { TokenProvider } from "./contexts/TokenProvider";
import Home from "./pages/home";
import Token from "./pages/token";
import { PrivyClientProvider } from "./providers/privy-client-provider";
import { ServerProvider } from "./providers/server-provider";
import { Page404 } from "./pages/404";

function App() {
    return (
        <PrivyClientProvider>
            <TokenProvider>
                <ServerProvider>
                    <SolPriceProvider>
                        <PortfolioProvider>
                            <_App />
                        </PortfolioProvider>
                    </SolPriceProvider>
                </ServerProvider>
            </TokenProvider>
        </PrivyClientProvider>
    );
}

function _App() {
    return (
        <div className="flex flex-col relative h-screen w-screen absolute top-0 left-0 right-0 z-50">
            <Router>
                <TopBar className="absolute top-0 left-0 right-0 z-50" />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/wiki/:id" element={<Token />} />
                    <Route path="/*" element={<Page404 />} />
                </Routes>
                <Disclaimer />
                <ServerStatus />
            </Router>
        </div>
    );
}

export default App;
