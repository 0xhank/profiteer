import supabase from "@/sbClient";
import env from "@bin/env";
import { TextGeneration } from "deepinfra";


interface WikiServiceType {
    getWikiPage: (page: string) => Promise<any>;
    getArticleSymbolOptions: (articleName: string) => Promise<string[]>;
}

export type WikiService = WikiServiceType;
export const WikiService = (): WikiServiceType => {
    const getWikiPage = async (page: string) => {
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${page}`
        );
        return response.json();
    };

    const getArticleSymbolOptions = async (articleName: string) : Promise<string[]> => {
        try {
            const cachedSymbols = await supabase
                .from("article_symbol_options")
                .select("symbol_options")
                .eq("article_name", articleName);
            if (cachedSymbols.data?.[0]?.symbol_options) {
                return cachedSymbols.data[0].symbol_options;
            }
            const content = await getWikiPage(articleName);
            const symbols = await generateSymbolOptions(content.extract);
            const {error: upsertError} = await supabase.from("article_symbol_options").upsert({
                article_name: articleName,
                symbol_options: symbols,
            });
            if (upsertError) {
                console.error(upsertError);
                throw new Error("Failed to upsert symbols");
            }
            return symbols;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const generateSymbolOptions = async (articleContent: string) => {
        const MODEL_URL =
            "https://api.deepinfra.com/v1/inference/deepseek-ai/DeepSeek-V3";
        const textGeneration = new TextGeneration(
            MODEL_URL,
            env.DEEPINFRA_API_KEY
        );
        const input = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You must respond with exactly 5 strings in a JSON array format. Nothing else. Each string must:

- Be an imaginary ticker symbol that is an abbreviation or acronym of the title of the article.
- Be 3-6 characters long, total. The goal is 3 characters, shorter the better.
- Describe the content passed in by the user.
<|start_header_id|>user<|end_header_id|>
${articleContent}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
        console.log({ input });
        const response = await textGeneration.generate({
            input: input,
            stop: ["<|eot_id|>"],
        });

        const responseText = response.results[0]?.generated_text;
        if (!responseText) {
            throw new Error("No response from model");
        }

        try {
            const symbols = JSON.parse(responseText);
            const ret = Array.isArray(symbols) && symbols.length === 5
                ? symbols
                : [];
            return ret
        } catch {
            throw new Error("Failed to parse response");
        }
    };

    return {
        getWikiPage,
        getArticleSymbolOptions,
    };
};
