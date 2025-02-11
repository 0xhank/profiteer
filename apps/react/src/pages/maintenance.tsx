import { ScrollingPages } from "../components/common/scrolling-pages";

export default function MaintenancePage() {
    return (
        <div className="relative h-screen overflow-hidden bg-white">
            <ScrollingPages />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img src="/logogif.webp" alt="Logo" className="w-48 h-48" />
                <p className="text-lg font-serif font-bold">
                    News = profit. Coming soon.
                </p>
                <p>
                    Follow the{" "}
                    <a
                        href="https://x.com/profiteernews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        official X account
                    </a>{" "}
                    for updates.
                </p>
            </div>
        </div>
    );
}
