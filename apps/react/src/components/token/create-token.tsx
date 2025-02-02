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

    useEffect(() => {
        handleGetSymbols();
    }, [articleName]);

    const effectiveSymbol = selectedSymbol;

    const handleGetSymbols = async () => {
        const symbols = await getArticleSymbolOptions.query({ articleName });
        console.log({ symbols });
        setSymbols(symbols.map((s) => "n" + s));
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
                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                        Symbol
                    </label>
                    <select
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                    >
                        <option value="Select a symbol">{effectiveSymbol}</option>
                        {symbols.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <CreateTokenButton
                name={articleName}
                symbol={effectiveSymbol}
                uri={imageUri ?? `https://api.news.fun/${articleName}`}
            />
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
