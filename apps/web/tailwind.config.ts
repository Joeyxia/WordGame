import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d2433",
        sky: "#6ec8ff",
        leaf: "#6cb46f",
        sand: "#f5e8b8",
        dusk: "#3e4f81"
      }
    }
  },
  plugins: []
};

export default config;
