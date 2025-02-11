import { useIdentityToken, usePrivy } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useServer } from "../hooks/useServer";
import supabase from "../sbClient";

interface AuthContextType {
    hasAccess: boolean | null;
    refreshInviteStatus: () => Promise<void>;
    attemptAuthorize: (code: string) => Promise<void>;
    ready: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const { user } = usePrivy();
    const [ready, setReady] = useState(false);
    const { requestAuth } = useServer();
    const { identityToken } = useIdentityToken();

    const checkInviteStatus = async () => {
        if (!user) return setHasAccess(false);
        try {
            const { data, error } = await supabase
                .from("invite_codes")
                .select("*")
                .eq("user", user.id)

            if (error) throw error;
            console.log({ data });
            setHasAccess(!!data);
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
        if (!identityToken) throw new Error("No identity token available");
        await requestAuth.mutate(
            {
                code,
            },
            {
                context: {
                    headers: {
                        authorization: "hello",
                        Cookie: `privy-id-token=${identityToken}`,
                    },
                },
            }
        );
    };

    useEffect(() => {
        checkInviteStatus();
    }, [user]);

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
