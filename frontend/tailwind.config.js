/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0b2545',
          darkNavy: '#07162c',
          blue: '#134074',
          lightBlue: '#8da9c4',
          ice: '#eef4f8',
          teal: '#006d77',
          emerald: '#059669',
          lightEmerald: '#d1fae5',
          saffron: '#d97706',
          amber: '#f59e0b',
          maroon: '#b91c1c',
          crimson: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        marathi: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
