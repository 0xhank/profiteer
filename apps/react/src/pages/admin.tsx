import { useState } from "react";
import HeadlineForm from "../components/admin/create-headline";
import { HeadlineEditor } from "../components/admin/edit-headline";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<"create" | "edit">("create");

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab("create")}
                    className={`px-4 py-2 rounded-lg ${
                        activeTab === "create"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                    Create Headline
                </button>
                <button
                    onClick={() => setActiveTab("edit")}
                    className={`px-4 py-2 rounded-lg ${
                        activeTab === "edit"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                    Edit Headlines
                </button>
            </div>

            {activeTab === "create" ? <HeadlineForm /> : <HeadlineEditor />}
        </div>
    );
};

export default AdminPage;
