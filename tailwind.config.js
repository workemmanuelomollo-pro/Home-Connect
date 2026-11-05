/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#effbfa",
          100: "#d8f2ef",
          200: "#b1e3de",
          300: "#83cec7",
          500: "#397f7d",
          600: "#286b69",
          700: "#205856",
          900: "#163f3f",
        },
      },
    },
  },
  plugins: [],
};