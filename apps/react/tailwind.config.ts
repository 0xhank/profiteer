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
        mister: ["var(--font-mister)", "sans-serif"],
        earlyquake: ["var(--font-earlyquake)", "sans-serif"],
        naganoshi: ["var(--font-naganoshi)", "sans-serif"],
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