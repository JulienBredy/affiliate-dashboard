/**** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}", // alle deine Source-Dateien
    ],
    theme: {
      extend: {
        boxShadow: {
          sm: '0px 5px 30px -10px rgba(0, 0, 0, 0.15)',
          DEFAULT: '0px 5px 30px -10px rgba(0, 0, 0, 0.15)',
        },
        fontFamily: {
          sans: ["var(--font-roboto)", "sans-serif"],
        },
      },
    },
    plugins: [],
  }