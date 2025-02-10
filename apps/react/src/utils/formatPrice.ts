export const formatPrice = (price: number) => {
    if (!price) return "0.00";

    if (price < 0.0001) {
        return price.toFixed(8);
    } else if (price < 0.01) {
        return price.toFixed(6);
    } else if (price < 1) {
        return price.toFixed(4);
    } else {
        return price.toFixed(2);
    }
};
type FormatOptions = {
    fractionDigits?: number;
    short?: boolean;
    showZero?: boolean;
    notLocale?: boolean;
};

export function formatNumber(
    num: number | bigint,
    options?: FormatOptions
): string {
    const digits =
        options?.fractionDigits === undefined ? 0 : options.fractionDigits;
    if (num === 0 || num === 0n) return options?.showZero ? "0" : "--";

    let ret = "";
    if (typeof num === "number") {
        if (options?.short) return shorten(num, digits);
        const fixedNum =
            digits == 0 ? String(Math.floor(num)) : num.toFixed(digits);
        if (num < 1) {
            return fixedNum.replace(/(\.\d*?[1-9])0+$|\.0*$/, "$1");
        }
        ret = options?.notLocale
            ? parseFloat(fixedNum).toString()
            : parseFloat(fixedNum).toLocaleString();
    }

    if (typeof num === "bigint") {
        if (options?.short) return shorten(Number(num), digits);
        ret = options?.notLocale ? num.toString() : num.toLocaleString();
    }
    return ret;
}

const shorten = (n: number, digits: number): string => {
    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;
    while (Math.abs(n) >= 1000 && unitIndex < units.length - 1) {
        n /= 1000;
        unitIndex++;
    }
    return getDecimals(n, digits) + units[unitIndex];
};

/**
 * Gets the decimal representation of a number.
 * @param num - The number.
 * @param max - The maximum number of decimal places.
 * @returns The decimal representation.
 */
function getDecimals(num: number, max = 3): string {
    const parts = num.toString().split(".");
    const digits = parts[1]
        ? parts[1].length > max
            ? max
            : parts[1].length
        : 0;
    return num.toFixed(digits);
}

export function formatVolume(volume: number, priceUsd: number) {
    console.log(volume, priceUsd);
    const val = (volume / 1e6) * priceUsd;
    return (
        "$" +
        formatNumber(val, { fractionDigits: val < 1 ? 4 : 0, short: val > 100 })
    );
}
