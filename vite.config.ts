import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tanstackRouter({target:'react', autoCodeSplitting: true})],
  base: "/stats/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
