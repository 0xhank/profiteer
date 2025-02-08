
export default function MaintenancePage() {
  
  

    return (
        <div className="relative min-h-screen w-full">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
                style={{ backgroundImage: 'url("/cloud-bg.webp")' }}
            />
            <div className="relative flex min-h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-[80pt] flex flex-col lg:flex-row lg:gap-2 text-center lg:text-[100pt] -mb-8">
                    <span className="font-serif font-semibold -mb-12 lg:-mb-8">
                        Profiteer{" "}
                    </span>
                    <span className="font-script font-semibold -mb-8 text-accent">
                        News
                    </span>
                </h1>
                
                <div className="mt-8 text-center bg-gray-400/30 p-8 backdrop-blur-xl max-w-xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-white">
                        Join the alpha group
                    </h2>
                    <ol className="list-decimal text-left space-y-4 max-w-md mx-auto pl-6">
                        <li className="text-lg text-white font-semibold">
                            Follow{" "}
                            <a
                                href="https://x.com/0xhank"
                                className="text-accent! hover:text-accent/80 transition-colors font-bold hover:underline!"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                0xhank
                            </a>{" "}
                            and{" "}
                            <a
                                href="https://x.com/profiteernews"
                                className="text-accent! hover:text-accent/80 transition-colors font-bold hover:underline!"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                profiteernews
                            </a>{" "}
                            on X
                        </li>
                        <li className="text-lg text-white font-semibold">
                            Repost{" "}
                            <a
                                href="https://x.com/profiteernews/status/1888328591504462186"
                                className="text-accent! hover:text-accent/80 transition-colors font-bold hover:underline!"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                this post on X
                            </a>
                        </li>
                        <li className="text-lg text-white font-semibold">
                            DM with your Telegram handle
                        </li>
                    </ol>
                </div>

                <a
                    href="https://x.com/profiteernews"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4"
                >
                    <img
                        src="https://imgs.search.brave.com/B6vwk9ItpE_OLonUNPFsN6SwMzKcwjW-YXgCvf6jzog/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9mcmVl/bG9nb3BuZy5jb20v/aW1hZ2VzL2FsbF9p/bWcvMTY5MDY0MzU5/MXR3aXR0ZXIteC1s/b2dvLXBuZy5wbmc"
                        alt="X"
                        className="max-w-8"
                    />
                </a>
            </div>
        </div>
    );
}
