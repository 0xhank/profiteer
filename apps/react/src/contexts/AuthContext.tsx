import { usePrivy } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useServer } from "../hooks/useServer";

interface AuthContextType {
    hasAccess: boolean | null;
    refreshInviteStatus: () => Promise<void>;
    attemptAuthorize: (code: string) => Promise<void>;
    ready: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const { user, ready: privyReady } = usePrivy();
    const [ready, setReady] = useState(false);
    const { requestAuth, isAuthorized } = useServer();

    const checkInviteStatus = async () => {
        if (!privyReady) return;
        try {
            if (!user) return setHasAccess(false);

            const authorized = await isAuthorized.query();
            setHasAccess(authorized);
        } catch (err) {
            console.error("Failed to check invite status:", err);
            setHasAccess(false);
        } finally {
            setReady(true);
        }
    };

    const refreshInviteStatus = async () => {
        await checkInviteStatus();
    };

    const attemptAuthorize = async (code: string) => {
        await requestAuth.mutate({ code });
    };

    useEffect(() => {
        checkInviteStatus();
    }, [user, privyReady]);

    return (
        <AuthContext.Provider
            value={{ hasAccess, refreshInviteStatus, attemptAuthorize, ready }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
