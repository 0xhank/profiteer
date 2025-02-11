import { usePrivy } from "@privy-io/react-auth";
import { ScrollingPages } from "../components/common/scrolling-pages";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    const { login, logout, ready, authenticated } = usePrivy();
    const { hasAccess, attemptAuthorize } = useAuth();
    let content = <div>Loading...</div>;
    if (ready) {
        if (authenticated && hasAccess) {
            content = <div>Redirecting...</div>;
        } else if (!authenticated) {
            content = (
                <div className="flex flex-col gap-4 items-center">
                    <button className="btn btn-accent btn-lg" onClick={login}>
                        Login
                    </button>
                </div>
            );
        } else {
            content = (
                <div className="flex flex-col gap-4 items-center p-2 bg-gray-800 rounded-sm">
                    <input
                        type="text"
                        maxLength={6}
                        pattern="[A-Za-z0-9]{6}"
                        className="input input-bordered w-48 text-center text-xl tracking-wider uppercase"
                        placeholder="ENTER CODE"
                        onChange={(e) => {
                            const code = e.target.value.toUpperCase();
                            if (code.length === 6) {
                                attemptAuthorize(code); // You might want to pass the code to your login function
                            }
                        }}
                    />
                </div>
            );
        }
    }

    return (
        <div className="relative h-screen overflow-hidden bg-white">
            <ScrollingPages />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex flex-col gap-2 items-center bg-gray-800 p-4 rounded-sm w-60">
                    <p className="text-2xl font-bold font-serif text-white">
                        Profiteer
                    </p>
                    {content}
                </div>
            </div>
            {authenticated && (
                <button
                    className="absolute top-4 right-4 btn btn-primary"
                    onClick={logout}
                >
                    Logout
                </button>
            )}
        </div>
    );
}
