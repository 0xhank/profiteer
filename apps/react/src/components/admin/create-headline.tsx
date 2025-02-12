import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import supabase, { uploadFile } from "../../sbClient";
import { getWikipediaAutocomplete } from "../../utils/getWikiAutocomplete";
import { Link } from "react-router-dom";

const HeadlineForm = () => {
    const [headline, setHeadline] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [caretPosition, setCaretPosition] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleHeadlineChange = async (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        const newValue = e.target.value;
        setHeadline(newValue);

        // Get cursor position
        const cursorPos = e.target.selectionStart;
        setCaretPosition(cursorPos);

        // Find the word being typed after @
        const textBeforeCursor = newValue.slice(0, cursorPos);
        const match = textBeforeCursor.match(/@(\w*)$/);

        if (match && match[1].length > 0) {
            const results = await getWikipediaAutocomplete(match[1]);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const insertWikiLink = (suggestion: string) => {
        if (!caretPosition) return;

        const beforeText = headline.slice(0, caretPosition);
        const afterText = headline.slice(caretPosition);
        const lastAtPos = beforeText.lastIndexOf("@");
        if (lastAtPos === -1) return;
        const name = suggestion.replace(/ /g, "_");

        const url = `/wiki/${encodeURIComponent(name)}`
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29");

        const newText =
            beforeText.slice(0, lastAtPos) +
            `[${suggestion}](${url})` +
            afterText;

        setHeadline(newText);
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

    const renderHeadlineWithLinks = (text: string) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }
            const href = decodeURIComponent(match[2]);
            parts.push(
                <Link
                    key={match.index}
                    to={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    {match[1]}
                </Link>
            );
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }
        return parts;
    };

    const getHeadlineNames = (text: string): string[] => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links = new Set<string>();
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            links.add(
                match[2]
                    .replace(/\/wiki\//g, "")
                    .replace(/%28/g, "(")
                    .replace(/%29/g, ")")
            ); // Push the link text (not the URL)
        }
        return Array.from(links);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        setSubmitting(true);

        let imageId = null;
        const names = getHeadlineNames(headline);
        try {
            if (image) {
                imageId = uuidv4();
                await uploadFile(imageId, image);
            }
            const {error } = await supabase.from("news_story").insert({
                content: headline,
                image_id: imageId,
                article_names: names
            });
            if (error) {
                toast.error("Error submitting headline");
                console.error(error);
            } else {
                toast.success("Headline submitted successfully");
            }
        } catch (error) {
            toast.error("Error submitting headline");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex gap-12 min-h-[600px]">
                <div className="flex-1 space-y-6">
                    <div className="relative w-[500px]">
                        <label
                            htmlFor="headline"
                            className="block text-lg font-medium mb-2"
                        >
                            Headline Content
                        </label>
                        <textarea
                            ref={textareaRef}
                            id="headline"
                            value={headline}
                            onChange={handleHeadlineChange}
                            className="w-full px-4 py-3 border rounded-md min-h-[400px] resize-y text-lg"
                            required
                            placeholder="Write your headline here... Use @ to link Wikipedia headlines"
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

                    {headline && (
                        <div className="mt-6 max-w-[500px]">
                            <h3 className="text-lg font-medium mb-3">
                                Preview:
                            </h3>
                            <div className="p-6 border rounded-md text-lg">
                                {renderHeadlineWithLinks(headline)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-[400px] space-y-6">
                    <div className="w-full">
                        <label className="block text-lg font-medium mb-2">
                            Headline Image
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
                                    Drag & drop an image here, or click to
                                    select one
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
            </div>

            <button
                onClick={handleSubmit}
                disabled={!headline || submitting}
                className="btn btn-primary"
            >
                Submit Headline
            </button>
        </div>
    );
};

export default HeadlineForm;