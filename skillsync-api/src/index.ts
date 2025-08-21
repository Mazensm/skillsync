import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const PORT = Number(process.env.PORT) || 5050


app.get('/health', (_req, res) => {
  res.json({ ok: true })
})


app.post('/analysis', (req, res) => {
  const { resumeText = '', jobText = '' } = req.body || {}
  if (typeof resumeText !== 'string' || typeof jobText !== 'string') {
    return res.status(400).json({ error: 'resumeText and jobText must be strings' })
  }

  const normalize = (s: string) =>
    s.toLowerCase()
     .replace(/[^a-z0-9+.# ]/g, ' ')
     .split(/\s+/)
     .filter(Boolean)

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

  res.json({
    summary: {
      overlapCount: overlap.length,
      missingCount: missing.length,
      extrasCount: extras.length
    },
    overlap: overlap.slice(0, 40),
    missing: missing.slice(0, 40),
    extras: extras.slice(0, 40)
  })
})

app.listen(PORT, () => {
  console.log(`SkillSync API on :${PORT}`)
})
