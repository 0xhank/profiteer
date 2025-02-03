import supabase from "@/sbClient";
import env from "@bin/env";
import { TextGeneration } from "deepinfra";


interface WikiServiceType {
    getWikiPage: (page: string) => Promise<any>;
    getArticleSymbolOptions: (articleName: string, hardRefresh?: boolean) => Promise<{symbols: string[], description: string}>;
}

export type WikiService = WikiServiceType;
export const WikiService = (): WikiServiceType => {
    const getWikiPage = async (page: string) => {
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${page}`
        );
        return response.json();
    };

    const getArticleSymbolOptions = async (articleName: string, hardRefresh: boolean = false) : Promise<{symbols: string[], description: string}> => {
        try {
            if (!hardRefresh) {
            const cachedSymbols = await supabase
                .from("article_symbol_options")
                .select("symbols, description")
                .eq("article_name", articleName);
            if (cachedSymbols.data?.[0]) {
                const symbols = cachedSymbols.data[0].symbols ?? [];
                const description = cachedSymbols.data[0].description ?? "";
                return {symbols: symbols, description: description};
            }
        }
            const content = await getWikiPage(articleName);
            const {symbols, description} = await generateSymbolOptions(content.extract);
            const {error: upsertError} = await supabase.from("article_symbol_options").upsert({
                article_name: articleName,
                symbols: symbols,
                description: description,
            });
            if (upsertError) {
                console.error(upsertError);
                throw new Error("Failed to upsert symbols");
            }
            return {symbols: symbols, description: description};
        } catch (error) {
            console.error(error);
            return {symbols: [], description: ""};
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
You must respond with a json with the following format: 
{
    "symbols": [
        "string",
        "string",
        "string",
        "string",
        "string",
        "string"
    ]
    "description": "string"
}

    ### For each element of the symbols array ### 
- Be an imaginary ticker symbol that is an abbreviation or acronym of the title of the article.
- Be 3-6 characters long, total. The first two are 3 characters. The 3-4 are 4 or 5 characters. The final two are 6 characters.

    ### For the description field ### 
- For the description, describe IN ONE SENTENCE the content passed in by the user. The description should be 100 characters.
<|start_header_id|>user<|end_header_id|>
${articleContent}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
console.log(input);
        const response = await textGeneration.generate({
            input: input,
            stop: ["<|eot_id|>"],
            temperature: Math.random() * 0.5 + 0.25,
            
        });

        const responseText = response.results[0]?.generated_text;
        if (!responseText) {
            throw new Error("No response from model");
        }

        try {
            const data : {symbols: string[], description: string} = JSON.parse(responseText);
            const ret = Array.isArray(data.symbols) 
                ? data.symbols
                : [];
            return {symbols: ret, description: data.description};
        } catch {
            throw new Error("Failed to parse response");
        }
    };

    return {
        getWikiPage,
        getArticleSymbolOptions,
    };
};
