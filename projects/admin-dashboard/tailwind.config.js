/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {}
  },
  plugins: [],
  // 避免与 antd 的 base styles 冲突
  corePlugins: {
    preflight: false
  }
};
