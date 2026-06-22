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
        apple: {
          blue: "#0071e3",
          "blue-hover": "#0077ed",
          gray: "#f5f5f7",
          "gray-border": "#d2d2d7",
          text: "#1d1d1f",
          "text-secondary": "#86868b",
          "text-tertiary": "#aeaeb2",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        apple: "0 2px 12px rgba(0,0,0,0.08)",
        "apple-hover": "0 4px 20px rgba(0,0,0,0.12)",
        "apple-sm": "0 1px 4px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        apple: "12px",
        "apple-sm": "8px",
      },
    },
  },
  plugins: [],
};
export default config;
