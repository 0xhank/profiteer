import supabase from "../sbClient";

export const updateSolPrice = async () => {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        const data = await response.json();
        const solPrice = data.solana.usd;
        await supabase.from("sol_price_usd").insert({
            price_usd: solPrice,
        });
    } catch (error) {
        console.error(error);
    }
};
