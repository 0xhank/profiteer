import { PageLayout } from "../components/common/page-layout";
import { BreakingNews } from "../components/home/breaking-news";
import { TokenList } from "../components/home/token-list";
import { YesterdayNews } from "../components/home/yesterday-news";
import { SearchBar } from "../components/common/search-bar";

export default function Home() {
    return (
        <PageLayout>
            <div className="flex flex-col animation gap-4 text-center animate-fade-in">
                <div className="space-y-4 flex flex-col items-center">
                    <TokenList />
                    <SearchBar />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t-4 border-double border-black">
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
