import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        nodePolyfills({
            // Whether to polyfill specific globals.
            globals: {
                process: true,
            },
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
        }),
    ],
    envDir: "../../",
    optimizeDeps: {
        include: ["buffer", "process"],
    },

});
