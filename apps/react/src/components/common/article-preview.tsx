import { Link } from "react-router-dom";

type PreviewProps = {
    href: string;
    children: React.ReactNode;
};

export function ArticlePreview({ href, children }: PreviewProps) {
    return (
        <div className="group relative inline-block">
            <Link to={href}>{children}</Link>
            <div className="invisible group-hover:visible pointer-events-none absolute left-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-50">
                {/* Preview content here */}
                <p>Preview content for {href}</p>
            </div>
        </div>
    );
}
