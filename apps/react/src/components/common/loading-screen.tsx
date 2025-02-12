import { ScrollingPages } from "./scrolling-pages";

export default function LoadingScreen() {
    return (
        <div className="relative h-screen overflow-hidden bg-white">
            <ScrollingPages />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <img src="/logogif.webp" alt="Logo" className="w-48 h-48" />
            </div>
        </div>
    );
}