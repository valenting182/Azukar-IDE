import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// Prefijo público donde se sirve la app. Vacío = raíz del dominio.
// En prod lo pone el build arg BASE_PATH del Dockerfile (ver docs/vps-https.md).
const base = process.env.VITE_BASE_PATH?.trim() || '/'

function yowaspPlugin(): Plugin {
  const yowaspRoot = path.resolve(root, 'node_modules/@yowasp')
  const mimeTypes: Record<string, string> = {
    '.js': 'application/javascript; charset=utf-8',
    '.wasm': 'application/wasm',
    '.tar': 'application/x-tar',
    '.json': 'application/json',
    '.data': 'application/octet-stream',
  }

  const handler = (req: any, res: any, next: any) => {
    if (!req.url) return next()
    const cleanUrl = req.url.split('?')[0]
    const prefix = `${base.replace(/\/+$/, '')}/yowasp/`.replace(/^\/\//, '/')
    if (cleanUrl.startsWith(prefix) || cleanUrl.startsWith('/yowasp/')) {
      const subPath = cleanUrl.startsWith(prefix)
        ? cleanUrl.slice(prefix.length)
        : cleanUrl.slice('/yowasp/'.length)
      const filePath = path.join(yowaspRoot, subPath)
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase()
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        fs.createReadStream(filePath).pipe(res)
        return
      }
    }
    next()
  }

  return {
    name: 'vite-plugin-yowasp',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  base,
  plugins: [vue(), tailwindcss(), yowaspPlugin()],
  worker: { format: 'es' },
  optimizeDeps: {
    exclude: ['@yowasp/yosys', '@yowasp/nextpnr-ice40'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@boards': path.resolve(root, '../boards'),
    },
  },
})
