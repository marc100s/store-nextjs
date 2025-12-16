import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Tailwind CSS v4 configuration
// Most configuration is now done in CSS via @theme directive
const config: Config = {
  darkMode: "selector",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [animate],
};

export default config;
