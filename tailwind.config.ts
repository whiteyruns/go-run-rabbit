import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Technical Vitality — Neon Pulse design system
        surface: {
          DEFAULT: "#0e0e11",
          dim: "#0e0e11",
          bright: "#2c2c30",
          container: {
            DEFAULT: "#19191d",
            low: "#131316",
            high: "#1f1f23",
            highest: "#25252a",
            lowest: "#000000",
          },
          variant: "#25252a",
          tint: "#aea2ff",
        },
        neon: {
          violet: "#aea2ff",
          "violet-dim": "#7157ff",
          cyan: "#00eefc",
          "cyan-dim": "#00deec",
          pink: "#ff6b98",
          "pink-dim": "#e4006c",
        },
        "on-surface": {
          DEFAULT: "#f3f0f4",
          variant: "#acaaae",
        },
        outline: {
          DEFAULT: "#767579",
          variant: "#48474b",
        },
        // Basin & Range — Mojave Monolith design system
        "br-bg": "#12110f",
        "br-surface": {
          DEFAULT: "#12110f",
          lowest: "#0c0b09",
          low: "#1a1815",
          container: "#252219",
          high: "#332e24",
          highest: "#3d3730",
          bright: "#4a4238",
        },
        "br-primary": { DEFAULT: "#e5c276", container: "#c4a35a", dim: "#d4b05e" },
        "br-on-primary": "#3f2e00",
        "br-secondary": "#d5c5a9",
        "br-tertiary": "#d3c4b2",
        "br-on-surface": { DEFAULT: "#e6e1e1", variant: "#d0c5b4" },
        "br-outline": { DEFAULT: "#9a9182", variant: "#584e3e" },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
