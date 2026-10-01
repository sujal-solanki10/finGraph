/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1220',
        secondary: '#111827',
        card: '#172033',
        primary: {
          DEFAULT: '#10B981',
          hover: '#059669',
        },
        text: {
          DEFAULT: '#F8FAFC',
          secondary: '#94A3B8',
        },
        border: '#263247',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
}
