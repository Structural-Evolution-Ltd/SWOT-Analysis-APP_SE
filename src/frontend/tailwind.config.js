/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#f3f7fa',
          100: '#e6eef4',
          200: '#c6d7e4',
          300: '#a3bfd3',
          400: '#739cb7',
          500: '#4f7f9f',
          600: '#396581',
          700: '#2f5167',
          800: '#284457',
          900: '#243949',
        },
      },
      boxShadow: {
        panel: '0 8px 24px rgba(28, 42, 56, 0.08)',
      },
    },
  },
  plugins: [],
}
