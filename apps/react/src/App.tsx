import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Disclaimer } from "./components/disclaimer";
import TimestampDisplay from "./components/timestamp-display";
import TopBar from "./components/top-bar/top-bar";
import { TokenListProvider } from "./contexts/TokenListContext";
import CreateToken from "./pages/create";
import Home from "./pages/home";
import Token from "./pages/token";
import { ServerProvider } from "./providers/server-provider";
import ServerStatus from "./components/server-status";

function App() {
  return (
    <div className="relative flex flex-col h-screen w-screen absolute top-0 left-0 right-0 z-50">
      <ServerProvider>
        <TokenListProvider>
          {/* <WalletBalanceProvider> */}
          <_App />
          {/* </WalletBalanceProvider> */}
        </TokenListProvider>
      </ServerProvider>
    </div>
  );
}

function _App() {
  return (
    <Router>
      <TopBar className="absolute top-0 left-0 right-0 z-50" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/token/:tokenId" element={<Token />} />
        <Route path="/create" element={<CreateToken />} />
      </Routes>
      <Disclaimer />
      <ServerStatus />
      <TimestampDisplay />
    </Router>
  );
}

export default App;
