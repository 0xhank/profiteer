import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

const ArticleForm = () => {
    const [article, setArticle] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [caretPosition, setCaretPosition] = useState<number | null>(null);

    const getWikipediaAutocomplete = async (query: string) => {
        const endpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
            query
        )}&limit=10&namespace=0&format=json&origin=*`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            return data[1];
        } catch (error) {
            console.error("Error fetching Wikipedia autocomplete:", error);
            return [];
        }
    };

    const handleArticleChange = async (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const newValue = e.target.value;
        setArticle(newValue);

        // Get cursor position
        const cursorPos = e.target.selectionStart;
        setCaretPosition(cursorPos);

        // Find the word being typed after @
        const textBeforeCursor = newValue.slice(0, cursorPos);
        const match = textBeforeCursor.match(/@(\w*)$/);

        if (match && match[1].length > 1) {
            const results = await getWikipediaAutocomplete(match[1]);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const insertWikiLink = (suggestion: string) => {
        if (!caretPosition) return;

        const beforeText = article.slice(0, caretPosition);
        const afterText = article.slice(caretPosition);

        // Find the @ position before cursor
        const lastAtPos = beforeText.lastIndexOf("@");
        if (lastAtPos === -1) return;

        // Create the markdown link with just the path
        const newText =
            beforeText.slice(0, lastAtPos) +
            `[${suggestion}](/wiki/${encodeURIComponent(suggestion)})` +
            afterText;

        setArticle(newText);
        setSuggestions([]);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) {
            setImage(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [],
        },
        maxFiles: 1,
    });

    const renderArticleWithLinks = (text: string) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            parts.push(
                <a
                    key={match.index}
                    href={match[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    {match[1]}
                </a>
            );
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }
        return parts;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log({ article, image });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-8">
            <div className="flex gap-12 min-h-[600px]">
                <div className="flex-1 space-y-6">
                    <div className="relative w-[500px]">
                        <label
                            htmlFor="article"
                            className="block text-lg font-medium mb-2"
                        >
                            Article Content
                        </label>
                        <textarea
                            ref={textareaRef}
                            id="article"
                            value={article}
                            onChange={handleArticleChange}
                            className="w-full px-4 py-3 border rounded-md min-h-[400px] resize-y text-lg"
                            required
                            placeholder="Write your article here... Use @ to link Wikipedia articles"
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-64 mt-1 bg-white border rounded-md shadow-lg">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                                        onClick={() =>
                                            insertWikiLink(suggestion)
                                        }
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {article && (
                        <div className="mt-6 max-w-[500px]">
                            <h3 className="text-lg font-medium mb-3">
                                Preview:
                            </h3>
                            <div className="p-6 border rounded-md text-lg">
                                {renderArticleWithLinks(article)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-[400px] h-full">
                    <label className="block text-lg font-medium mb-2">
                        Article Image
                    </label>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 cursor-pointer text-center sticky top-8 text-lg h-[calc(100%-40px)] flex flex-col justify-center
                            ${
                                isDragActive
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300"
                            }`}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>Drop the image here ...</p>
                        ) : (
                            <p>
                                Drag & drop an image here, or click to select
                                one
                            </p>
                        )}
                        {image && (
                            <div className="mt-6">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Preview"
                                    className="max-w-full mx-auto rounded-md"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={!article || !image}
                className={`w-full mt-12 py-3 px-6 rounded-md text-lg
                    ${
                        article && image
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
            >
                Submit Article
            </button>
        </form>
    );
};

export default ArticleForm;
