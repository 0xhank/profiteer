import { useState } from "react";
import HeadlineForm from "../components/admin/create-headline";
import { HeadlineEditor } from "../components/admin/edit-headline";
import { toast } from "react-toastify";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<"create" | "edit">("create");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Replace this with your actual password or better yet, a proper auth system
        if (password === "bigbank") {
            setIsAuthenticated(true);
        } else {
            toast.error("Wrong password!");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-[1100px] mx-auto flex justify-center items-center mt-20 p-8 bg-white rounded-lg shadow-md">
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
            </div>
        );
    }

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
