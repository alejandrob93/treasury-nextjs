'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const r = await fetch('/api/treasury', { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();

        // Validate the shape we actually have
        const results = Array.isArray(json?.results) ? json.results : [];

        const normalized = results.map((item) => {
          const id = String(item?.id ?? '—');
          const obsArray = Array.isArray(item?.observations) ? item.observations : [];

          // Take the last observation as “latest” (guarded)
          const latest = obsArray.length ? obsArray[obsArray.length - 1] : null;

          const date = latest?.date ?? '—';
          let value = latest?.value ?? null;

          // Normalize numeric value (FRED can return "NaN" or "." strings sometimes)
          if (value === '.' || value === undefined || value === null) value = null;
          if (typeof value === 'string') {
            const parsed = Number(value);
            value = Number.isFinite(parsed) ? parsed : null;
          }

          return { id, date, value };
        });

        if (alive) {
          setRows(normalized);
          setErr('');
        }
      } catch (e) {
        if (alive) setErr(e?.message || 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main style={{ maxWidth: 880, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ marginBottom: 8 }}>US Treasury Yields</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Latest daily yield shown for each series (from FRED).
      </p>

      {loading && <div>Loading…</div>}
      {!!err && (
        <div style={{ color: 'crimson', marginTop: 12 }}>
          Error: {err}
        </div>
      )}

      {!loading && !err && rows.length === 0 && (
        <div style={{ color: '#64748b', marginTop: 12 }}>
          No data available.
        </div>
      )}

      {!loading && !err && rows.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <Th>Series</Th>
              <Th>Date</Th>
              <Th>Yield (%)</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, date, value }) => (
              <tr key={id}>
                <Td>{id}</Td>
                <Td>{date}</Td>
                <Td>{value ?? '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '10px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td
      style={{
        padding: '10px',
        borderBottom: '1px solid #f1f5f9',
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  );
}
