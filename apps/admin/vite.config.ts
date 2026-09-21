import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  server: {
    port: 5002,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  build: {
    // Splitting the code into smaller, independent vendor packages
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20000,
          groups: [
            {
              name: 'vendor',
              test: /node_modules/, // All libraries go to a separate cache file
            },
          ],
        },
      },
    },
  },
})
