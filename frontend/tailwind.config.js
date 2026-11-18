/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twin: {
          dark: '#0B0F19',
          card: '#151C2C',
          accent: '#3B82F6',
          cyan: '#06B6D4',
          emerald: '#10B981',
          rose: '#F43F5E',
          purple: '#8B5CF6',
          amber: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
