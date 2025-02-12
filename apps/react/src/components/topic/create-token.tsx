import { VersionedTransaction } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useServer } from "../../hooks/useServer";
import { LoadingPane } from "../common/loading";

export const CreateToken = ({
    articleName,
    articleContent,
    refresh,
}: {
    articleName: string;
    articleContent: string | null;
    refresh: () => void;
}) => {
    const imageUri = useMemo(() => {
        if (!articleContent) {
            return null;
        }
        const image = articleContent.match(/<img[^>]*src="([^"]+)"[^>]*>/);
        console.log(image);
        if (image) {
            return image[1];
        }
        return null;
    }, [articleContent]);

    const { getArticleSymbolOptions } = useServer();

    const [symbols, setSymbols] = useState<string[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (articleContent) {
            handleGetSymbols(false);
        }
    }, [articleContent]);

    const effectiveSymbol = selectedSymbol;

    const handleGetSymbols = async (hardRefresh: boolean = false) => {
        setIsLoading(true);
        try {
            const symbols = await getArticleSymbolOptions.query({
                articleName,
                hardRefresh,
            });
            setSymbols(symbols.map((s) => "n" + s));
        } catch (error) {
            toast.error("Error generating symbols");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!articleContent) {
        return <LoadingPane className="h-full w-full" />;
    }
    return (
        <div className="bg-white rounded-md p-4 space-y-6">
            <div className="card-title">Create a token for this topic</div>
            {imageUri && (
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <img src={imageUri} alt="Profile" className="h-48" />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <p className="label">Name</p>
                    <p>{articleName.replace(/_/g, " ")}</p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="label">Ticker</p>
                        <button
                            onClick={() => handleGetSymbols(true)}
                            className="btn btn-sm btn-outline"
                            disabled={isLoading}
                        >
                            Regenerate
                            <img
                                src="https://imgs.search.brave.com/GbWrfYb7yqHRy-Nn1tZ8-Qv1CZ9UBGjGlAm6jEJ0m8E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZWdp/c3RyeS5ucG1taXJy/b3IuY29tL0Bsb2Jl/aHViL2ljb25zLXN0/YXRpYy1wbmcvbGF0/ZXN0L2ZpbGVzL2Rh/cmsvZGVlcHNlZWst/Y29sb3IucG5n"
                                className="w-4 h-4"
                            />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="opacity-50 h-20">Generating...</div>
                    ) : (
                        <div className="flex flex-wrap gap-2 h-20">
                            {symbols.map((symbol) => (
                                <button
                                    key={symbol}
                                    onClick={() => setSelectedSymbol(symbol)}
                                    className={`btn btn-sm ${
                                        selectedSymbol === symbol
                                            ? "btn-accent"
                                            : "btn-secondary opacity-50"
                                    }`}
                                >
                                    {symbol}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateTokenButton
                name={articleName}
                symbol={effectiveSymbol}
                uri={imageUri ?? `https://api.news.fun/${articleName}`}
                disabled={!effectiveSymbol}
                refresh={refresh}
            />
        </div>
    );
};

const CreateTokenButton = (props: {
    name: string;
    symbol: string;
    uri: string;
    disabled: boolean;
    refresh: () => void;
}) => {
    const { createBondingCurveTx, sendCreateBondingCurveTx } = useServer();
    const { wallet } = usePortfolio();
    const [isLoading, setIsLoading] = useState(false);

    const onSendTransaction = async () => {
        if (!wallet) return;
        setIsLoading(true);
        try {
            const { txMessage, txId } = await createBondingCurveTx.mutate({
                ...props,
                userPublicKey: wallet.address,
            });
            const serializedTx = Buffer.from(txMessage, "base64");
            const tx = VersionedTransaction.deserialize(serializedTx);
            const signedTx = await wallet.signTransaction(tx);

            await sendCreateBondingCurveTx.mutate({
                txId,
                txMessage: uint8ArrayToBase64(signedTx.serialize()),
            });

            toast.success("Token created");
            props.refresh();
        } catch (error) {
            toast.error("Error creating token");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onSendTransaction}
            className="btn btn-primary btn-block rounded-none"
            disabled={props.disabled || isLoading}
        >
            {isLoading ? "Creating..." : "Create Token"}
        </button>
    );
};

const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
    return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
};
