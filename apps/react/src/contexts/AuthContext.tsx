import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../sbClient";
import { usePrivy } from "@privy-io/react-auth";

interface AuthContextType {
    hasAccess: boolean | null;
    refreshInviteStatus: () => Promise<void>;
    attemptAuthorize: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const { user, authenticated, ready } = usePrivy();

    const checkInviteStatus = async () => {
        if (!user || !authenticated || !ready) return setHasAccess(false);
        try {
            const { data, error } = await supabase
                .from("invite_codes")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error) throw error;
            setHasAccess(!!data);
        } catch (err) {
            console.error("Failed to check invite status:", err);
            setHasAccess(false);
        }
    };

    const refreshInviteStatus = async () => {
        await checkInviteStatus();
    };

    const attemptAuthorize = async (code: string) => {
        // TODO: Implement authorization logic
    };

    useEffect(() => {
        checkInviteStatus();
    }, []);

    return (
        <AuthContext.Provider
            value={{ hasAccess, refreshInviteStatus, attemptAuthorize }}
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
