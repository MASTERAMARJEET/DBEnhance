/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('tailwind-config/tailwind.config.cjs')

module.exports = {
  plugins: {
    tailwindcss: { config },
    autoprefixer: {},
  },
}
