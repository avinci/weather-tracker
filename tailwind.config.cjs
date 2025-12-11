/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{vue,js}",
    "./components/**/*.{vue,js}",
    "./stores/**/*.js",
    "./services/**/*.js",
    "./utils/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

