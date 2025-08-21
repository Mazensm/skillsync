import type { VercelRequest, VercelResponse } from '@vercel/node'

function normalize(s: string) {
  return s.toLowerCase()
    .replace(/[^a-z0-9+.# ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST /api/analysis' })
  }

  
  let body: any = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }

  const resumeText = (body?.resumeText ?? '') as string
  const jobText = (body?.jobText ?? '') as string
  if (typeof resumeText !== 'string' || typeof jobText !== 'string') {
    return res.status(400).json({ error: 'resumeText and jobText must be strings' })
  }

  const resumeTokens = new Set(normalize(resumeText))
  const jobTokens = new Set(normalize(jobText))

  const overlap: string[] = []
  const missing: string[] = []
  const extras: string[] = []

  for (const t of jobTokens) {
    if (resumeTokens.has(t)) overlap.push(t)
    else missing.push(t)
  }
  for (const t of resumeTokens) {
    if (!jobTokens.has(t)) extras.push(t)
  }

  return res.json({
    summary: {
      overlapCount: overlap.length,
      missingCount: missing.length,
      extrasCount: extras.length
    },
    overlap: overlap.slice(0, 40),
    missing: missing.slice(0, 40),
    extras: extras.slice(0, 40)
  })
}
