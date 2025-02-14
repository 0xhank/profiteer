import { env } from "../../bin/env";
import supabase from "../sbClient";
import { GetJupiterPriceResponse } from "../types";

export const startPriceUpdateLoop = async () => {
    setInterval(async () => {
        try {
            await priceUpdate();
        } catch (error) {
            console.error("Error in price update loop:", error);
        }
    }, 2000); // Run every 2 seconds
};

const priceUpdate = async () => {
    const { data: mints, error } = await supabase
        .from("token_migration")
        .select("mint")
        .eq("migrated", true);
    const BATCH_SIZE = 50; // Adjust this number based on your needs
    const BATCH_DELAY = 500;
    const results = [];
    if (error) {
        console.error(error);
        return;
    }

    // Process mints in batches
    if (mints.length === 0) {
        return;
    }
    for (let i = 0; i < mints.length; i += BATCH_SIZE) {
        const batch = mints.slice(i, i + BATCH_SIZE);
        const response = await fetchWithRetry(
            `${env.JUPITER_URL}/price?ids=${batch.map((m) => m.mint).join(",")}`
        );
        const data = (await response.json()) as GetJupiterPriceResponse;
        // add a delay between batches
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
    }

    return Object.fromEntries(results);
};

export const fetchPrices = async (mints: string[]) => {
    const response = await fetchWithRetry(
        `${env.JUPITER_URL}/price?ids=${mints}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        },
        1_000
    );
    const data = await response.json();
    return data;
};

export const fetchWithRetry = async (
    input: URL | string,
    init?: RequestInit,
    retry = 5_000,
    timeout = 300_000
): Promise<Response> => {
    const controller = new AbortController();
    // Set a timeout for the fetch call
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        // Fetch the URL
        const response = await fetch(input, {
            ...init,
            signal: controller.signal,
        });

        // Clear the timeout in case of success
        clearTimeout(id);
        return response;
    } catch (error) {
        // Clear the timeout in case of error
        clearTimeout(id);

        console.error(
            `Fetch error: ${String(error)}. Retrying in ${
                retry / 1000
            } seconds...`
        );
        // Wait for the retry delay and retry
        await new Promise((resolve) => setTimeout(resolve, retry));
        return fetchWithRetry(input, init, retry, timeout);
    }
};
