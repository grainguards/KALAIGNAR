/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#C36F50",   // earthy accent
        secondary: "#E0B7A3",
        background: "#FDFBF7", // warm ivory
        surface: "#FFFFFF",
        textMain: "#2A2624",
        textMuted: "#6B6562",
      }
    },
  },
  plugins: [],
}
