import { defineConfig } from "vite"
import uni from "@dcloudio/vite-plugin-uni"
import { BASEURL } from "./config"

export default defineConfig({
  plugins: [uni()],
  server: {
    proxy: {
      "/app": {
        target: BASEURL,
        changeOrigin: true
      }
    }
  }
})
