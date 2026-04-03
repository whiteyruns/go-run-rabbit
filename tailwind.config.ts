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
        // Basin & Range — Mojave Monolith design system (flat keys to avoid TW3 nesting issues)
        "br-bg": "#12110f",
        "br-surface": "#12110f",
        "br-surface-lowest": "#0c0b09",
        "br-surface-low": "#1a1815",
        "br-surface-container": "#252219",
        "br-surface-high": "#332e24",
        "br-surface-highest": "#3d3730",
        "br-surface-bright": "#4a4238",
        "br-primary": "#e5c276",
        "br-primary-container": "#c4a35a",
        "br-primary-dim": "#d4b05e",
        "br-on-primary": "#3f2e00",
        "br-secondary": "#d5c5a9",
        "br-tertiary": "#d3c4b2",
        "br-on-surface": "#e6e1e1",
        "br-on-surface-variant": "#d0c5b4",
        "br-outline": "#9a9182",
        "br-outline-variant": "#584e3e",
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
