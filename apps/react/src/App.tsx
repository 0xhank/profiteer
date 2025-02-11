import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import TopBar from "./components/top-bar/top-bar";
import { PortfolioProvider } from "./contexts/PortfolioContext";
import { SolPriceProvider } from "./contexts/SolPriceContext";
import { TokenProvider } from "./contexts/TokenProvider";
import { Page404 } from "./pages/404";
import Home from "./pages/home";
import Token from "./pages/topic";
import { PrivyClientProvider } from "./providers/privy-client-provider";
import { ServerProvider } from "./providers/server-provider";
import Admin from "./pages/admin";
import Maintenance from "./pages/maintenance";
import { PreviewProvider } from "./contexts/PreviewContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/login";
import { Privacy } from "./pages/privacy";
import { Terms } from "./pages/terms";
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
    if (!ready && !import.meta.env.VITE_SKIP_INVITE) return <Maintenance />;
    if (!hasAccess && !import.meta.env.VITE_SKIP_INVITE) return <Login />;
    return (
        <div className="flex flex-col items-center h-screen w-screen absolute top-0 left-0 right-0 z-50 bg-gray-100">
            <TopBar className="absolute top-0 left-0 right-0 z-50" />
            <div
                className="flex justify-center overflow-y-auto w-full h-full pt-8 md:pt-16"
            >
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
