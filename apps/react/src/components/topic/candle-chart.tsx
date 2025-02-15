import {
    CandlestickSeries,
    ColorType,
    ISeriesApi,
    Time,
} from "lightweight-charts";

import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";
type ChartProps = {
    data: {
        time: Time;
        open: number;
        high: number;
        low: number;
        close: number;
    }[];
    colors: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
    className?: string;
};
export const CandleChart = (props: ChartProps) => {
    const {
        data,
        colors: { backgroundColor = "white", textColor = "black" } = {},
        className,
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick">>();

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
            height: 350,
            rightPriceScale: {
                visible: true,
                borderVisible: false,
            },
        });
        chart.timeScale().fitContent();
        chart.timeScale().applyOptions({
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: number) => {
                const date = new Date(time * 1000);
                return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            },
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: "#26a69a",
            downColor: "#ef5350",

            priceFormat: {
                type: "custom",
                minMove: 0.00001,
                formatter: (price: number) => {
                    if (price < 0.000001) return price.toExponential(2);
                    return price.toPrecision(4);
                },
            },
        });
        series.setData(data);
        seriesRef.current = series;

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);

            chart.remove();
        };
    }, []);

    useEffect(() => {
        const lastData = data[data.length - 1];
        if (seriesRef.current && lastData) {
            seriesRef.current.update(lastData);
        }
    }, [data]);

    return <div ref={chartContainerRef} className={className} />;
};
