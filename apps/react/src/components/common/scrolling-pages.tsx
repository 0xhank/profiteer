import { useEffect, useState } from "react";

export function ScrollingPages() {
    const [columnCount, setColumnCount] = useState(8);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            const columnCount = Math.ceil(width / 236);
            setColumnCount(columnCount);
        };

        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    return (
        <>
            <div className="flex" style={{ width: `${columnCount * 236}px` }}>
                {Array.from({ length: columnCount }, (_, i) => i + 1).map(
                    (num) => (
                        <div
                            key={num}
                            className="animate-scroll w-[236px]"
                            style={{
                                animation: `scroll ${
                                    60 + num * 15
                                }s linear infinite`,
                            }}
                        >
                            <img
                                src={`/lists/list${(num % 5) + 1}.png`}
                                alt={`Scrolling list ${num}`}
                                className="w-[236px] min-h-[200vh] opacity-15"
                            />
                            <img
                                src={`/lists/list${(num % 5) + 1}.png`}
                                alt={`Scrolling list ${num} duplicate`}
                                className="w-[236px] min-h-[200vh] opacity-15"
                            />
                        </div>
                    )
                )}
            </div>
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
                }}
            />
        </>
    );
}
