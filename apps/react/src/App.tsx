import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Token from "./pages/token";
import Home from "./pages/home";
import TopBar from "./components/top-bar/top-bar";
import { Disclaimer } from "./components/disclaimer";
import { PrivyClientProvider } from "./providers/privy-client-provider";
import { SolanaPriceProvider } from "./contexts/SolanaPriceContext";
import { ServerProvider } from "./providers/server-provider";


function App() {

  return (
    <ServerProvider>
        <PrivyClientProvider>
          <SolanaPriceProvider>
            {/* <WalletBalanceProvider> */}
            <_App />
            {/* </WalletBalanceProvider> */}
          </SolanaPriceProvider>
        </PrivyClientProvider>
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
        <Disclaimer className="absolute bottom-0 left-0 right-0 z-50" />
      </div>
    </Router>
  );
}

export default App;
