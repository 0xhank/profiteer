import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Disclaimer } from "./components/disclaimer";
import ServerStatus from "./components/server-status";
import TopBar from "./components/top-bar/top-bar";
import { SolanaPriceProvider } from "./contexts/SolanaPriceContext";
import { TokenListProvider } from "./contexts/TokenListContext";
import Home from "./pages/home";
import Token from "./pages/token";
import { ServerProvider } from "./providers/server-provider";
import TimestampDisplay from "./components/timestamp-display";

function App() {
  return (
    <ServerProvider>
      <SolanaPriceProvider>
        <TokenListProvider>
          {/* <WalletBalanceProvider> */}
          <_App />
          {/* </WalletBalanceProvider> */}
        </TokenListProvider>
      </SolanaPriceProvider>
    </ServerProvider>
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
        <Disclaimer />
        <ServerStatus />
        <TimestampDisplay />
      </div>
    </Router>
  );
}

export default App;
