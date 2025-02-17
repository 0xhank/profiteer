import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import LoadingScreen from "./components/common/loading-screen";
import TopBar from "./components/top-bar/top-bar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { PreviewProvider } from "./contexts/PreviewContext";
import { SolPriceProvider } from "./contexts/SolPriceContext";
import { TokenProvider } from "./contexts/TokenProvider";
import { Page404 } from "./pages/404";
import Admin from "./pages/admin";
import Home from "./pages/home";
import Login from "./pages/login";
import Maintenance from "./pages/maintenance";
import { Privacy } from "./pages/privacy";
import { Terms } from "./pages/terms";
import Token from "./pages/topic";
import { PrivyClientProvider } from "./providers/privy-client-provider";
import { ServerProvider } from "./providers/server-provider";
function App() {
    if (import.meta.env.VITE_MAINTENANCE) {
        return <Maintenance />;
    }
    return (
        <Router>
            <PrivyClientProvider>
                <TokenProvider>
                    <ServerProvider>
                        <SolPriceProvider>
                            <PortfolioProvider>
                                <PreviewProvider>
                                    <AuthProvider>
                                        <AppContent />
                                        <ToastContainer
                                            position="bottom-right"
                                            theme="dark"
                                        />
                                        <div
                                            id="modal-root"
                                            className="fixed top-0 pointer-events-auto z-50"
                                        />
                                    </AuthProvider>
                                </PreviewProvider>
                            </PortfolioProvider>
                        </SolPriceProvider>
                    </ServerProvider>
                </TokenProvider>
            </PrivyClientProvider>
        </Router>
    );
}

function AppContent() {
    const { hasAccess, ready } = useAuth();

    if (!ready) return <LoadingScreen />;
    // if (!hasAccess) return <Login />;
    return (
        <div className="flex flex-col items-center h-screen w-screen absolute overflow-y-auto top-0 left-0 right-0 z-50 bg-gray-100">
            <TopBar />
            <div className="flex justify-center w-full h-full ">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/wiki/:id" element={<Token />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/*" element={<Page404 />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
