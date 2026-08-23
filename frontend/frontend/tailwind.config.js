/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        severity: {
          low: "#16a34a",
          medium: "#ca8a04",
          high: "#ea580c",
          critical: "#dc2626",
        },
        brand: {
          DEFAULT: "#0f172a",
          light: "#1e293b",
          accent: "#0ea5e9",
        },
      },
    },
  },
  plugins: [],
};
