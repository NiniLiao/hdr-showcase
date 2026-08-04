import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getHighlights } from './_lib/handlers.js'
import { resolveLocale } from './_lib/types.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Use GET.' })
  }

  const locale = resolveLocale(req.query.lang, req.headers['accept-language'])
  const { status, body } = getHighlights(locale)

  res.setHeader('Vary', 'Accept-Language')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return res.status(status).json(body)
}
