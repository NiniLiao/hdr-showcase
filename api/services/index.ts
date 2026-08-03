import type { VercelRequest, VercelResponse } from '@vercel/node'
import { listServices } from '../_lib/handlers'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Use GET.' })
  }

  const query = typeof req.query.q === 'string' ? req.query.q : undefined
  const { status, body } = listServices(query)
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return res.status(status).json(body)
}
