import { useEffect, useState } from "react";
import { getHeadlineList, updateHeadline } from "../../sbClient";
import { LoadingPane } from "../common/loading";

type Headline = {
    article_names: string[] | null;
    content: string;
    created_at: string;
    id: number;
    image_id: string | null;
    imageUrl: string | null;
};

export function HeadlineEditor() {
    const [headlines, setHeadlines] = useState<Headline[] | null>(null);
    const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(
        null
    );
    const [editContent, setEditContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchHeadlines = async () => {
            const headlines = await getHeadlineList(
                ITEMS_PER_PAGE,
                (currentPage - 1) * ITEMS_PER_PAGE
            );
            setHeadlines(headlines);
            setTotalPages(Math.ceil(headlines.length / ITEMS_PER_PAGE));
        };
        fetchHeadlines();
    }, [currentPage]);

    if (!headlines) return <LoadingPane className="h-[600px]" />;

    const handleHeadlineSelect = (headline: Headline) => {
        setSelectedHeadline(headline);
        setEditContent(headline.content);
    };

    const handleSubmit = async () => {
        if (!selectedHeadline) return;

        setIsSubmitting(true);
        try {
            await updateHeadline(
                selectedHeadline.id,
                editContent,
                selectedHeadline.image_id
            );
            // Update local state
            setHeadlines(
                headlines?.map((a) =>
                    a.id === selectedHeadline.id
                        ? { ...a, content: editContent }
                        : a
                ) || null
            );
            setSelectedHeadline(null);
        } catch (error) {
            console.error("Failed to update headline:", error);
            alert("Failed to update headline");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="flex gap-4 p-4">
            <div className="w-1/3 border-r pr-4">
                <h2 className="text-xl font-bold mb-4">Headlines</h2>
                <div className="space-y-2">
                    {headlines.map((headline) => (
                        <div
                            key={headline.id}
                            onClick={() => handleHeadlineSelect(headline)}
                            className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                selectedHeadline?.id === headline.id
                                    ? "bg-gray-100"
                                    : ""
                            }`}
                        >
                            <p className="font-medium truncate">
                                {headline.content}
                            </p>
                            <p className="text-sm text-gray-500">
                                {new Date(
                                    headline.created_at
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="w-2/3">
                {selectedHeadline ? (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Edit Headline</h2>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-48 p-2 border rounded"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isSubmitting ? "Updating..." : "Update Headline"}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select an headline to edit
                    </div>
                )}
            </div>
        </div>
    );
}
