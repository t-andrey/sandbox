/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#faf8f3',
          100: '#F5F0E8',
          200: '#ede5d4',
          300: '#ddd0ba',
        },
        indigo: {
          950: '#0f0f4a',
          900: '#1a1a6e',
          800: '#1e2080',
          700: '#2525a0',
        },
        terracotta: {
          300: '#dfa07a',
          400: '#C97D4E',
          500: '#b56a3a',
          600: '#9a5528',
        },
        matcha: {
          400: '#7a9e6e',
          500: '#5d7d51',
          600: '#4a6340',
        },
        gold: {
          400: '#d4a843',
          500: '#b8942e',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        japanese: ['"Noto Serif JP"', 'serif'],
      },
    },
  },
  plugins: [],
}
