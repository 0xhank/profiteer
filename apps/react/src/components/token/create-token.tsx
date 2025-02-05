import { useEffect, useMemo, useState } from "react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useServer } from "../../hooks/useServer";

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
        const image = articleContent.match(/<img src="([^"]+)"/);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card bg-base-200 p-4 shadow-sm rounded rounded-sm space-y-6">
            <div className="card-title">Create a token</div>
            {imageUri && (
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <img
                            src={imageUri}
                            alt="Profile"
                            className="shadow-lg"
                        />
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
                            {isLoading ? "Loading..." : "Regenerate"}
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="opacity-50">Loading...</div>
                    ) : (
                        <div className="space-y-2">
                            {symbols.map((symbol) => (
                                <label
                                    key={symbol}
                                    className="flex items-center space-x-2"
                                >
                                    <input
                                        type="radio"
                                        value={symbol}
                                        checked={selectedSymbol === symbol}
                                        onChange={(e) =>
                                            setSelectedSymbol(e.target.value)
                                        }
                                        className="radio radio-primary"
                                    />
                                    <span>{symbol}</span>
                                </label>
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

    const onSendTransaction = async () => {
        if (!wallet) {
            return;
        }
        try {
            const {txMessage} = await createBondingCurveTx.mutate({
                ...props,
                userPublicKey: wallet.address,
            });
            const txMessageUint8Array = base64ToUint8Array(txMessage);
            const signature = await wallet.signMessage(txMessageUint8Array);

            await sendCreateBondingCurveTx.mutate({
                userPublicKey: wallet.address,
                txMessage: txMessage,
                signature: uint8ArrayToBase64(signature),
            });

            props.refresh();

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <button
            onClick={onSendTransaction}
            className="btn btn-primary"
            disabled={props.disabled}
        >
            Create Token
        </button>
    );
};

const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
    return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
};

const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    return new Uint8Array(
        binaryString.split("").map((char) => char.charCodeAt(0))
    );
};
