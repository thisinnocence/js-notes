import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// path 需要下面命令安装
// pnpm add -D @types/node

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@views': path.resolve(__dirname, 'src/views'),
    }
  }
})
