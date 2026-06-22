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
        vibe: {
          purple: "#7C3AED",
          "purple-dark": "#6D28D9",
          "purple-light": "#A78BFA",
          amber: "#F59E0B",
          "amber-light": "#FCD34D",
          pink: "#EC4899",
          green: "#10B981",
          "green-light": "#6EE7B7",
          cream: "#FFFBEB",
          "cream-dark": "#FEF3C7",
          bg: "#FAFAFA",
          text: "#1F2937",
          "text-secondary": "#6B7280",
          "text-muted": "#9CA3AF",
          border: "#E5E7EB",
          "card-bg": "#FFFFFF",
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
        vibe: "0 4px 14px rgba(124,58,237,0.12)",
        "vibe-lg": "0 12px 36px rgba(124,58,237,0.18)",
        "vibe-hover": "0 8px 28px rgba(124,58,237,0.15)",
        card: "0 2px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 32px rgba(0,0,0,0.1)",
        amber: "0 4px 14px rgba(245,158,11,0.2)",
      },
      borderRadius: {
        vibe: "20px",
        "vibe-sm": "16px",
        "vibe-xs": "14px",
      },
    },
  },
  plugins: [],
};
export default config;
