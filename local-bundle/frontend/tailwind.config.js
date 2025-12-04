/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          teal: '#075E54',
          green: '#25D366',
          light: '#DCF8C6',
          bg: '#ECE5DD',
        }
      }
    },
  },
  plugins: [],
}
