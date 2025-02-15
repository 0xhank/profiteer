import supabase from "@/sbClient";
import env from "@bin/env";
import { PrivyClient, WalletWithMetadata } from "@privy-io/server-auth";
import { PublicKey } from "@solana/web3.js";

export type UserContext = {
    userId: string;
    walletPublicKey: PublicKey;
};

export class AuthService {
    privy: PrivyClient;

    constructor() {
        this.privy = new PrivyClient(
            env.VITE_ENV === "development"
                ? env.DEV_PRIVY_APP_ID
                : env.PROD_PRIVY_APP_ID,
            env.VITE_ENV === "development"
                ? env.DEV_PRIVY_APP_SECRET
                : env.PROD_PRIVY_APP_SECRET
        );
    }

    /**
     * Verifies a JWT token and returns the associated user context
     * @param token - JWT token to verify
     * @returns The verified user context including wallet
     * @throws Error if JWT is invalid or user has no wallet
     */
    async getUserContext(token: string): Promise<UserContext> {
        try {
            const verifiedClaims = await this.privy.verifyAuthToken(token);
            const userId = verifiedClaims.userId;
            if (!userId) {
                throw new Error("User is not registered with Privy");
            }

            const user = await this.privy.getUserById(userId);
            const solanaWallet = user.linkedAccounts.find(
                (account) =>
                    account.type === "wallet" && account.chainType === "solana"
            ) as WalletWithMetadata | undefined;

            if (!solanaWallet?.address) {
                throw new Error(
                    "User does not have a wallet registered with Privy"
                );
            }

            return {
                userId,
                walletPublicKey: new PublicKey(solanaWallet.address),
            };
        } catch (e: unknown) {
            throw new Error(
                `Invalid JWT or user context: ${
                    e instanceof Error ? e.message : "Unknown error"
                }`
            );
        }
    }

    async isAuthorized(userId: string) {
        const { data, error } = await supabase
            .from("invite_codes")
            .select("*")
            .eq("user", userId)
            .limit(1)
        return !!data?.[0];
    }
    async requestAuth(userId : string, code: string) {

        const { data, error } = await supabase
            .from("invite_codes")
            .select("*")
            .eq("user", userId)
            .limit(1)

        if (error || data.length === 1) throw new Error("User already has access");

        const { data: codeData, error: codeError } = await supabase
            .from("invite_codes")
            .select("*")
            .eq("code", code)
            .limit(1)

        console.log({ codeData, codeError });
        if (codeError || codeData.length === 0) throw new Error("Invalid code");
        if (codeData[0]?.user !== null) throw new Error("Code has been used");

        await supabase
            .from("invite_codes")
            .update({ user: userId, used_at: new Date().toISOString() })
            .eq("code", code);

        return { success: true };
    }
}
