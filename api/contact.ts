import type { VercelRequest, VercelResponse } from '@vercel/node'
import { submitContact } from './_lib/handlers'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Use POST.' })
  }

  const { status, body } = submitContact(req.body)
  return res.status(status).json(body)
}
