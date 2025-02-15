import { useState } from "react";
import { toast } from "react-toastify";
import HeadlineForm from "../components/admin/create-headline";
import { HeadlineEditor } from "../components/admin/edit-headline";
import { PageLayout } from "../components/common/page-layout";
import { Migrate } from "../components/admin/migrate";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<
        "create" | "edit" | "migrations"
    >("create");
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Initialize from localStorage if available
        return localStorage.getItem("isAdminAuthenticated") === "true";
    });
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "bigbank") {
            setIsAuthenticated(true);
            localStorage.setItem("isAdminAuthenticated", "true");
        } else {
            toast.error("Wrong password!");
        }
    };

    if (!isAuthenticated) {
        return (
            <PageLayout className="max-w-[1100px] mx-auto flex justify-center items-center mt-20 p-8 bg-white rounded-lg shadow-md">
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </PageLayout>
        );
    }

    return (
        <PageLayout className="max-w-7xl mx-auto p-8">
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
                <button
                    onClick={() => setActiveTab("migrations")}
                    className={`px-4 py-2 rounded-lg ${
                        activeTab === "migrations"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                    Migrations
                </button>
            </div>

            {activeTab === "create" ? (
                <HeadlineForm />
            ) : activeTab === "edit" ? (
                <HeadlineEditor />
            ) : (
                <Migrate />
            )}
        </PageLayout>
    );
};

export default AdminPage;
