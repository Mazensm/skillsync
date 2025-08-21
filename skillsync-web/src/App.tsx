import React, { useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? '/api/analysis'


const STOP = new Set([
  'a','an','and','the','to','of','in','with','on','for','is','are','as','at','by','be','or','from','this','that','it','its',
  'we','our','you','your','they','their','i','me','my','us','them','he','she','his','her','was','were','will','would',
  's','t','ll','re','ve','not','but','if','than','then','about'
])
const prettyList = (arr: string[], max=60) =>
  Array.from(new Set(arr))              // dedupe
    .filter(t => t.length > 2 && !STOP.has(t)) // basic filtering
    .slice(0, max)

export default function App() {
  const [resumeText, setResume] = useState('')
  const [jobText, setJob] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function analyze() {
    setLoading(true); setError(null); setResult(null)
    try {
      const { data } = await axios.post(API_URL, { resumeText, jobText })
      setResult(data)
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const overlap = useMemo(() => result ? prettyList(result.overlap) : [], [result])
  const missing = useMemo(() => result ? prettyList(result.missing) : [], [result])
  const extras  = useMemo(() => result ? prettyList(result.extras)  : [], [result])

  return (
    <div className="wrapper">
      <h1 className="h1">SkillSync</h1>
      <p className="sub">Paste your resume and a job description. We’ll highlight overlaps, gaps, and extras.</p>

      <div className="row">
        <div className="card">
          <h3>Resume</h3>
          <textarea value={resumeText} onChange={e => setResume(e.target.value)} placeholder="Paste your resume text here…" />
          <div style={{height:12}} />
          <h3>Job Description</h3>
          <textarea value={jobText} onChange={e => setJob(e.target.value)} placeholder="Paste the job description here…" />
          <div style={{display:'flex', gap:12, marginTop:14}}>
            <button className="btn" onClick={analyze} disabled={loading || !resumeText || !jobText}>
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
            <button className="btn" style={{background:'transparent', color:'var(--muted)', border:'1px solid var(--chip-border)'}}
                    onClick={() => { setResume(''); setJob(''); setResult(null); setError(null); }}>
              Clear
            </button>
          </div>
          {error && <div className="footer-note" style={{color:'var(--bad)'}}><strong>Error:</strong> {error}</div>}
        </div>

        <div className="card">
          <h3>Results</h3>

          {!result && <div className="footer-note">Run an analysis to see results here.</div>}

          {result && (
            <>
              <div className="kpis">
                <div className="kpi ok">
                  <div className="label">Overlap</div>
                  <div className="value">{result.summary?.overlapCount ?? overlap.length}</div>
                </div>
                <div className="kpi warn">
                  <div className="label">Missing</div>
                  <div className="value">{result.summary?.missingCount ?? missing.length}</div>
                </div>
                <div className="kpi bad">
                  <div className="label">Extras</div>
                  <div className="value">{result.summary?.extrasCount ?? extras.length}</div>
                </div>
              </div>

              <div className="section">
                <h4>Key Overlaps</h4>
                <div className="chips">
                  {overlap.length ? overlap.map(t => <span key={'o-'+t} className="chip">{t}</span>) : <span className="footer-note">No clear overlaps detected.</span>}
                </div>
              </div>

              <div className="section">
                <h4>Missing vs Job</h4>
                <div className="chips">
                  {missing.length ? missing.map(t => <span key={'m-'+t} className="chip">{t}</span>) : <span className="footer-note">No significant gaps 🎉</span>}
                </div>
              </div>

              <div className="section">
                <h4>Extras (in Resume only)</h4>
                <div className="chips">
                  {extras.length ? extras.map(t => <span key={'e-'+t} className="chip">{t}</span>) : <span className="footer-note">No extras.</span>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
