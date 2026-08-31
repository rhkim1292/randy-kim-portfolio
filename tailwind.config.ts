import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: "#12141C",
          panel: "#181B26",
          panelAlt: "#1E2230",
          line: "#2A2E3F",
          text: "#EDEAE3",
          muted: "#8B90A6",
          amber: "#E8A33D",
          teal: "#5FB3A3",
          violet: "#8B7EC8",
          rose: "#D9707A",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0.4) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1) rotate(20deg)" },
        },
        "glow-shimmer": {
          "0%, 100%": { boxShadow: "0 0 18px -6px var(--tw-shadow-color)" },
          "50%": { boxShadow: "0 0 36px -2px var(--tw-shadow-color)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        sparkle: "sparkle 1.1s ease-in-out infinite",
        "glow-shimmer": "glow-shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
