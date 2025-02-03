import { useEffect, useMemo, useState } from "react";
import { useServer } from "../../hooks/useServer";

export const CreateToken = ({
    articleName,
    articleContent,
}: {
    articleName: string;
    articleContent: string | null;
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
    const [description, setDescription] = useState<string>("");
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
            const {symbols, description }= await getArticleSymbolOptions.query({
                articleName,
                hardRefresh,
            });
            setSymbols(symbols.map((s) => "n" + s));
            setDescription(description);
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
                    <p className="label">Description</p>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="loading..."
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled

                    />
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
                description={description}
                disabled={!effectiveSymbol}
            />
        </div>
    );
};

const CreateTokenButton = (props: {
    name: string;
    symbol: string;
    uri: string;
    description: string;
    disabled: boolean;
}) => {
    const { createBondingCurve } = useServer();

    const onSendTransaction = async () => {
        console.log(props);
        try {
            const tx = await createBondingCurve.mutate(props);
            console.log({ tx });
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
