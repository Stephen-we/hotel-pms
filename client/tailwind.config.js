/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",     // blue
        primaryDark: "#1d4ed8",
        sidebar: "#050816",
        cardBg: "#0f172a",
        soft: "#1e293b",
      },
    },
  },
  plugins: [],
}
