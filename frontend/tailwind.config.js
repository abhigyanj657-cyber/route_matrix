/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saathi: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        matrix: {
          dark: '#0B1120',
          card: '#1E293B',
          border: '#334155',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          amber: '#F59E0B',
        }
      },
    },
  },
  plugins: [],
}
