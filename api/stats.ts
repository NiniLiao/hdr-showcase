import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getStats } from './_lib/handlers'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Use GET.' })
  }

  const { status, body } = getStats()
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  return res.status(status).json(body)
}
