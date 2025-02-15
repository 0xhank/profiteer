import { ScrollingPages } from "../components/common/scrolling-pages";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Login() {
    const {
        hasAccess,
        attemptAuthorize,
        refreshInviteStatus,
        ready: authReady,
    } = useAuth();

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    let content = <img src="/logogif.webp" alt="Logo" className="w-48 h-48" />;
    if (authReady) {
        if (hasAccess) {
            content = <div>Redirecting...</div>;
        } else {
            content = (
                <div className="flex flex-col gap-4 items-center p-2 bg-gray-800 rounded-sm">
                    <input
                        type="text"
                        maxLength={6}
                        pattern="[A-Za-z0-9]{6}"
                        className="input input-bordered w-48 text-center text-xl tracking-wider uppercase"
                        placeholder="ENTER CODE"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        disabled={loading}
                    />
                    <button
                        className="btn btn-accent btn-lg"
                        disabled={loading}
                        onClick={async () => {
                            try {
                                setLoading(true);
                                await attemptAuthorize(code);
                                setLoading(false);
                                await refreshInviteStatus();
                            } catch {
                                toast.error("Invalid code");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Submit
                    </button>
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
        </div>
    );
}
