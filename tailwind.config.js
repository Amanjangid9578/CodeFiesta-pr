/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2e8cf',
          100: '#e6efd4',
          200: '#a7c957',
          300: '#6a994e',
          400: '#6a994e',
          500: '#386641',
          600: '#386641',
          700: '#2d5234',
          800: '#24402a',
          900: '#1e3324',
          950: '#15241a',
        },
        forest: '#386641',
        leaf: '#6a994e',
        lime: '#a7c957',
        cream: '#f2e8cf',
        brick: '#bc4749',
        navy: {
          800: '#0f172a',
          900: '#0b0f19',
          950: '#070a10',
        }
      },
      fontFamily: {
        sans: ['Helvetica', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
