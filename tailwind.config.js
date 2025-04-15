/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}", // alle deine Source-Dateien
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ["var(--font-roboto)", "sans-serif"],
        },
      },
    },
    plugins: [],
  }