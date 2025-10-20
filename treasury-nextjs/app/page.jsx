'use client'

import './globals.css'
import React, { useEffect, useState, useCallback } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

const MATURITY_KEYS = ['1M','3M','6M','1Y','2Y','3Y','5Y','7Y','10Y','20Y','30Y']
const POLL_INTERVAL_MS = 60_000

function point(ts, y) {
  return { time: new Date(ts).toLocaleString(), ...y }
}

export default function Page(){
  const [latest, setLatest] = useState({ timestamp: new Date().toISOString(), yields: Object.fromEntries(MATURITY_KEYS.map(k=>[k,null])) })
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [polling, setPolling] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      const res = await fetch('/api/treasury', { cache: 'no-store' })
      if(!res.ok) throw new Error('API error ' + res.status)
      const data = await res.json()
      setLatest(data)
      setHistory(h => [...h.slice(-199), point(data.timestamp, data.yields)])
    } catch (e) {
      setError(e.message)
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    refresh()
    if(!polling) return
    const id = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [refresh, polling])

  const spread = (latest.yields['2Y'] ?? null) !== null && (latest.yields['10Y'] ?? null) !== null
    ? (latest.yields['10Y'] - latest.yields['2Y']).toFixed(2) + '%'
    : '—'

  return (
    <div className="container">
      <motion.div initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}}>
        <h1 className="title">Treasury Yields — Live Dashboard</h1>
        <div className="subtitle">Updated: {new Date(latest.timestamp).toLocaleString()} • 2s–10s spread: <span className="mono">{spread}</span></div>
      </motion.div>

      <div className="row">
        <div className="card grow">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <div className="mono">Current Yields</div>
            <div style={{display:'flex', gap:8}}>
              <button onClick={refresh}>Refresh</button>
              <button onClick={()=>setPolling(p=>!p)}>{polling? 'Pause':'Resume'} Polling</button>
            </div>
          </div>
          <div className="grid">
            {MATURITY_KEYS.map(m => (
              <div key={m} className="pill">
                <div className="muted">{m}</div>
                <div className="mono" style={{fontSize:20}}>
                  {latest.yields[m] != null ? latest.yields[m].toFixed(2) + '%' : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card side">
          <div className="mono" style={{marginBottom:8}}>Status</div>
          {isLoading && <div>Loading…</div>}
          {error && <div style={{color:'#ff8383'}}>Error: {error}</div>}
          {!isLoading && !error && <div>Live and polling every {POLL_INTERVAL_MS/1000}s.</div>}
          <div className="muted" style={{marginTop:8}}>
            API: Next.js route → FRED • Set <code>FRED_API_KEY</code> in Vercel/Netlify.
          </div>
          <div className="muted" style={{marginTop:8}}>
            Tip: Watch curve inversions (2s–10s &lt; 0).
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="mono" style={{marginBottom:8}}>History</div>
        <div style={{height:380}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis dataKey="time" tick={{fontSize:11}}/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              {MATURITY_KEYS.map(m => (
                <Line key={m} type="monotone" dataKey={m} strokeWidth={2} dot={false}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <div className="mono" style={{marginBottom:8}}>Raw (latest)</div>
        <pre>{JSON.stringify(latest, null, 2)}</pre>
      </div>
    </div>
  )
}
