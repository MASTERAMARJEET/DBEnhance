/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // app content
    `src/**/*.{html,js,ts,jsx,tsx}`,
    // include packages if not transpiling
    '../../packages/ui/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brandblue: colors.blue[500],
        brandred: colors.red[500],
      },
    },
  },
  plugins: [require('daisyui')],
}
