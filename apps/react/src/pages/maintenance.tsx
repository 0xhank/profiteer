import bs58 from "bs58";
import React, { useState } from "react";

export default function MaintenancePage() {
    const [address, setAddress] = useState("");
    const [isValid, setIsValid] = useState(true);
    const isBs58 = (id: string) => {
        try {
            bs58.decode(id);
            return true;
        } catch {
            return false;
        }
    };
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddress(value);
        setIsValid(value === "" || (value.length === 44 && isBs58(value)));
    };

    const handleSubmit = () => {
        if (!isValid) {
            return;
        }
        console.log(address);
    };

    return (
        <div className="relative min-h-screen w-full">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
                style={{ backgroundImage: 'url("/cloud-bg.webp")' }}
            />
            <div className="relative flex min-h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-[100pt] -mb-8">
                    <span className="font-serif font-semibold -mb-8">Profiteer</span>
                </h1>
                        <p className="text-sm text-red-500 h-4">

                    {!isValid && "Invalid Solana address"}
                    {isValid && <p>{ }</p>}
                </p>
                <div className="w-full max-w-md px-4">
                    <input
                        type="text"
                        value={address}
                        onChange={handleAddressChange}
                        placeholder="Enter Solana wallet address"
                        className={`w-full rounded-lg border p-2 bg-white/50 ${
                            isValid ? "border-gray-300" : "border-red-500"
                        }`}
                    />

                </div>
                <button
                    onClick={handleSubmit}
                    className="btn btn-accent text-black"
                    // disabled={address === "" || !isValid}
                    disabled={true}
                >
                    Waitlist closed
                </button>
                <a
                    href="https://x.com/profiteernews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4"
                >
                    <img
                        src="https://imgs.search.brave.com/B6vwk9ItpE_OLonUNPFsN6SwMzKcwjW-YXgCvf6jzog/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9mcmVl/bG9nb3BuZy5jb20v/aW1hZ2VzL2FsbF9p/bWcvMTY5MDY0MzU5/MXR3aXR0ZXIteC1s/b2dvLXBuZy5wbmc"
                        alt="X"
                        className="max-w-8"
                    />
                </a>
            </div>
        </div>
    );
}
