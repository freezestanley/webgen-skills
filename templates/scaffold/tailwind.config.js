/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './**/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // GATE-2 方案确定后填入
        primary: '#3B82F6',
        secondary: '#10B981',
      },
      fontFamily: {
        // GATE-2 方案确定后填入
        heading: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
