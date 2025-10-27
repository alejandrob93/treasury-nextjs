'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/treasury', { cache: 'no-store' });
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error || 'Request failed');
        setRows(json.results || []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 880, margin: '40px auto', padding: '0 16px' }}>
      <h1>US Treasury Yields</h1>
      <p style={{ color: '#666' }}>Latest daily yields (FRED)</p>

      {err && <div style={{ color: 'crimson' }}>Error: {err}</div>}
      {!err && rows.length === 0 && <div>Loading…</div>}

      {rows.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th style={th}>Series</th>
              <th style={th}>Date</th>
              <th style={th}>Yield (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, observations }) => {
              const latest = observations[observations.length - 1]; // latest point
              return (
                <tr key={id}>
                  <td style={td}>{id}</td>
                  <td style={td}>{latest?.date ?? '—'}</td>
                  <td style={td}>{latest?.value ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}

const th = { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #e5e7eb' };
const td = { padding: '8px 10px', borderBottom: '1px solid #f1f5f9' };
