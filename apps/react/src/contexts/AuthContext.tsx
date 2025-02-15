import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
    const [ready, setReady] = useState(false);
    const id = useMemo(() => {
        const savedId = localStorage.getItem("user_session_id");
        if (savedId) return savedId;
        const newId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("user_session_id", newId);
        return newId;
    }, []);
    const { requestAuth, isAuthorized } = useServer();

    const checkInviteStatus = async () => {
        console.log("Checking invite status for id:", id);
        if (!id) return;
        try {
            const authorized = await isAuthorized.query({ id: id });
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
        await requestAuth.mutate({ code, id });
    };

    useEffect(() => {
        checkInviteStatus();
    }, [id]);

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
