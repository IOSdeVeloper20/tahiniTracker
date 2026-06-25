/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1D9E75",
          light: "#E1F5EE",
          dark: "#0F6E56",
        },
        amber: {
          soft: "#FAEEDA",
          text: "#854F0B",
        },
        danger: {
          soft: "#FCEBEB",
          text: "#A32D2D",
          border: "#F09595",
        },
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};
