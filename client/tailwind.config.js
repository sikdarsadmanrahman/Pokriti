/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Organic/fresh food brand palette: leafy green primary, warm honey accent.
        brand: {
          50: '#f2f9ee', 100: '#e0f1d6', 200: '#c2e3ae', 300: '#9dd17e',
          400: '#78bd54', 500: '#5aa137', 600: '#457f29', 700: '#376423',
          800: '#2f5020', 900: '#28431d',
        },
        honey: {
          50: '#fffaeb', 100: '#fef0c7', 200: '#fce087', 300: '#fbc949',
          400: '#f9b122', 500: '#f0930a', 600: '#d46e06', 700: '#b04d09',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: { card: '0 2px 10px -2px rgb(0 0 0 / 0.08)' },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      animation: { 'slide-in': 'slide-in .25s ease-out', 'fade-in': 'fade-in .2s ease-out' },
    },
  },
  plugins: [],
};
