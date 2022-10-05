import solid from 'solid-start/vite'
import vercel from 'solid-start-vercel'
import node from 'solid-start-node'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    solid({
      adapter: {
        build: vercel({ edge: true }),
        start: node(),
      },
    }),
  ],
})
