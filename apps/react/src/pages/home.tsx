import { PageLayout } from "../components/common/page-layout";
import { BreakingNews } from "../components/home/breaking-news";
import { YesterdayNews } from "../components/home/yesterday-news";

export default function Home() {
    return (
        <PageLayout className = "gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
                <div className="col-span-2 space-y-4">
                    <BreakingNews />
                </div>
                <div className="hidden md:block col-span-1 space-y-4">
                    <YesterdayNews />
                </div>
            </div>
        </PageLayout>
    );
}
