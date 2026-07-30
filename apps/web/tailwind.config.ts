import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          light: "#132C4F",
          dark: "#060F1D",
        },
        teal: {
          DEFAULT: "#1E9AA8",
          light: "#5FC4CF",
        },
        status: {
          ready: "#1F8A4C",
          partial: "#B8860B",
          gap: "#C9660A",
          significant: "#B3261E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
