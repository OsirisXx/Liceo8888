/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d7',
          300: '#f4a9b6',
          400: '#ec7a90',
          500: '#df4d6d',
          600: '#cb2d55',
          700: '#ab2045',
          800: '#800020',
          900: '#5c1a2e',
          950: '#3d0a18',
        },
        gold: {
          50: '#fffef7',
          100: '#fffceb',
          200: '#fff5c2',
          300: '#ffec99',
          400: '#ffe066',
          500: '#ffd700',
          600: '#d4af37',
          700: '#b8960c',
          800: '#8b7500',
          900: '#5c4d00',
          950: '#3d3300',
        },
      },
    },
  },
  plugins: [],
}

