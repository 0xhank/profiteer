import { useEffect, useMemo, useState } from "react";
import { useServer } from "../../hooks/useServer";

export const CreateToken = ({
    articleName,
    articleContent,
}: {
    articleName: string;
    articleContent: string;
}) => {
    const imageUri = useMemo(() => {
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
        handleGetSymbols(false);
    }, [articleName]);

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
        <div className="space-y-6">
            {imageUri && (
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <img
                            src={imageUri}
                            alt="Profile"
                            className="rounded-full border-4 border-blue-500 shadow-lg transform transition-all duration-300 hover:scale-105"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                        Name
                    </label>
                    <div className="text-gray-700 dark:text-gray-300">
                        {articleName}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Symbol
                        </label>
                        <button
                            onClick={() => handleGetSymbols(true)}
                            className="btn btn-sm btn-outline"
                            disabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Refresh Symbols"}
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-gray-500">Loading symbols...</div>
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
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {symbol}
                                    </span>
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
            />
            <div className="text-gray-700 dark:text-gray-300">
                {JSON.stringify(symbols)}
            </div>
        </div>
    );
};

const CreateTokenButton = (props: {
    name: string;
    symbol: string;
    uri: string;
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
        <button onClick={onSendTransaction} className="btn btn-primary">
            Create Token
        </button>
    );
};
