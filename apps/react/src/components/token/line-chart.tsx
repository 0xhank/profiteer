import { ColorType, LineSeries, UTCTimestamp } from "lightweight-charts";

import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
type ChartProps = {
    data: { time: string; value: number }[];
    colors: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
    className?: string;
};
export const LineChart = (props: ChartProps) => {
    const {
        data,
        colors: {
            backgroundColor = "white",
            lineColor = "#2962FF",
            textColor = "black",
            areaTopColor = "#2962FF",
            areaBottomColor = "rgba(41, 98, 255, 0.28)",
        } = {},
        className,
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (!chartContainerRef.current) return;
            chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
            });
        };

        if (!chartContainerRef.current) return;
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
        });
        chart.timeScale().fitContent();

        const formattedData: { time: UTCTimestamp; value: number }[] = data.map((item) => ({
            time: Math.floor(new Date(item.time).getTime() / 1000) as UTCTimestamp,
            value: item.value,
        }));

        const newSeries = chart.addSeries(LineSeries, {
            color: lineColor,
        });
        newSeries.setData(formattedData);

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);

            chart.remove();
        };
    }, [
        data,
        backgroundColor,
        lineColor,
        textColor,
        areaTopColor,
        areaBottomColor,
    ]);

    return <div ref={chartContainerRef} className={className} />;
};
