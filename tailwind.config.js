/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Add this line
  ],
}