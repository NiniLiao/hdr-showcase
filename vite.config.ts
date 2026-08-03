import { fileURLToPath, URL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { getService, getStats, listServices, submitContact } from './api/_lib/handlers'
import { resolveLocale } from './api/_lib/types'

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : null)
      } catch {
        resolve(null)
      }
    })
  })
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

/**
 * `vercel dev` runs the real functions in api/. This keeps plain `npm run dev`
 * working by routing the same pure handlers through Vite's connect server.
 */
function devApi(): Plugin {
  return {
    name: 'hdr-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()

        const locale = resolveLocale(
          url.searchParams.get('lang') ?? undefined,
          req.headers['accept-language'],
        )

        if (url.pathname === '/api/stats' && req.method === 'GET') {
          const { status, body } = getStats(locale)
          return send(res, status, body)
        }

        if (url.pathname === '/api/services' && req.method === 'GET') {
          const { status, body } = listServices(url.searchParams.get('q') ?? undefined, locale)
          return send(res, status, body)
        }

        const match = url.pathname.match(/^\/api\/services\/([\w-]+)$/)
        if (match && req.method === 'GET') {
          const { status, body } = getService(match[1], locale)
          return send(res, status, body)
        }

        if (url.pathname === '/api/contact' && req.method === 'POST') {
          const { status, body } = submitContact(await readJson(req))
          return send(res, status, body)
        }

        return send(res, 404, { error: 'No such endpoint.' })
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), devApi()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['vue', 'pinia', 'vue-i18n'] },
      },
    },
  },
})
