import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Oro di brand (#F5C141) come accento
        brand: {
          50: "#fefaf0",
          100: "#fdf3d8",
          200: "#fbe7a8",
          300: "#f8d873",
          400: "#f5c141",
          500: "#eaad24",
          600: "#cf8f18",
          700: "#a66a18",
          800: "#88541a",
          900: "#73461b",
        },
        // Teal scuro di brand (#0A2838) per testo e azioni principali
        ink: {
          50: "#eef4f6",
          100: "#d6e2e7",
          200: "#b0c6cf",
          300: "#82a3b0",
          400: "#557e8f",
          500: "#3b6173",
          600: "#2d4d5d",
          700: "#26404e",
          800: "#1a3140",
          900: "#0a2838",
          950: "#061a25",
        },
        // Crema di brand (#FFFEF6) per lo sfondo
        cream: "#fffef6",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
