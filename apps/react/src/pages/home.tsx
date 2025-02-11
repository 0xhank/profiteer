import { PageLayout } from "../components/common/page-layout";
import { BreakingNews } from "../components/home/breaking-news";
import { YesterdayNews } from "../components/home/yesterday-news";

export default function Home() {
    return (
        <PageLayout className = "gap-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                    <BreakingNews />
                </div>
                <div className="col-span-1 space-y-4">
                    <YesterdayNews />
                </div>
            </div>
        </PageLayout>
    );
}
