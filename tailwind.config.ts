import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf3f4",
          100: "#fbe5e8",
          200: "#f6ccd3",
          300: "#eea3b0",
          400: "#e27188",
          500: "#d04763",
          600: "#bb2f4f",
          700: "#9d2342",
          800: "#84203c",
          900: "#711f38",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
