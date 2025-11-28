/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode using the .dark class

  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      spacing: {
        30: "7.5rem",
        70: "17.5rem",
        35: "8.75rem",
        50: "12.5rem",
      },

      backgroundImage: {
        "footer-light": "linear-gradient(180deg, #ffffff, #f7f7f7)",
        "footer-dark": "linear-gradient(180deg, #0D0D0D, #000000)",
      },

      transitionProperty: {
        theme: "background-color, color, border-color, fill, stroke",
      },
    },
  },

  plugins: [],
};