import { useMemo } from "react";
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

    const symbol = useMemo(() => {
        const symbol = articleContent.match(/class="fn">([^<]+)</);
        if (symbol) {
            return "n" + symbol[1].slice(0, 4).toUpperCase();
        }
        return "nUNKNOWN";
    }, [articleContent]);

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
                    <div className="text-gray-700 dark:text-gray-300">
                        {symbol}
                    </div>
                </div>
            </div>

            <CreateTokenButton
                name={articleName}
                symbol={symbol}
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
        <button
            onClick={onSendTransaction}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:scale-105 transform transition-all duration-300 shadow-lg"
        >
            Create Token
        </button>
    );
};
