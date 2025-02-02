import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        caslon: ["Libre Caslon Text", "serif"],
        kaushan: ["Kaushan Script", "serif"],
        comic: ["Comic Neue", "serif"],
        roboto: ['Roboto', 'sans-serif'],

      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0, 0) rotate(12deg)" },
          "25%": { transform: "translate(-5px, -5px) rotate(8deg)" },
          "50%": { transform: "translate(5px, 5px) rotate(15deg)" },
          "75%": { transform: "translate(-5px, -5px) rotate(10deg)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;