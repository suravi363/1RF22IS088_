import React, { useMemo, useState } from 'react'
import { daysFromNowIso, generateShortcode, isAlphanumeric, isUniqueShortcode, isValidUrl, logEvent, readStorage, writeStorage } from './utils.js'

export default function ShortenerPage({ navigate }) {
  const [rows, setRows] = useState(() => Array.from({ length: 5 }, () => ({ url: '', days: 30, code: '' })))
  const [errors, setErrors] = useState(Array(5).fill(''))
  const [results, setResults] = useState([])

  const existing = useMemo(() => readStorage(), [])

  function updateRow(idx, field, value) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }

  function validate() {
    const items = readStorage()
    const codes = new Set(items.map((i) => i.shortcode))

    const newErrors = rows.map((r) => {
      if (!r.url) return 'URL is required'
      if (!isValidUrl(r.url)) return 'Invalid URL format'
      if (r.days && Number.isNaN(Number(r.days))) return 'Validity must be a number'
      if (r.code) {
        if (!isAlphanumeric(r.code)) return 'Shortcode must be alphanumeric'
        if (codes.has(r.code)) return 'Shortcode already exists'
      }
      return ''
    })

    setErrors(newErrors)
    return newErrors.every((e) => !e)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) {
      logEvent('shorten_validation_failed', { rows })
      return
    }
    const items = readStorage()
    const updated = [...items]
    const created = []

    rows.forEach((r) => {
      if (!r.url) return
      let code = r.code || generateShortcode()
      while (!isUniqueShortcode(code, updated)) {
        code = generateShortcode()
      }
      const now = new Date().toISOString()
      const expiryIso = daysFromNowIso(r.days || 30)
      const entry = {
        shortcode: code,
        longUrl: r.url,
        createdIso: now,
        expiryIso,
        clicks: 0,
        history: [],
      }
      updated.push(entry)
      created.push(entry)
    })

    writeStorage(updated)
    setResults(created)
    logEvent('shorten_created', { count: created.length })
  }

  return (
    <div className="container">
      <h2>Shorten URLs</h2>
      <form className="card" onSubmit={handleSubmit}>
        {rows.map((r, idx) => (
          <div className="row" key={idx}>
            <div className="field">
              <label>Long URL</label>
              <input
                type="url"
                placeholder="https://example.com/path"
                value={r.url}
                onChange={(e) => updateRow(idx, 'url', e.target.value)}
              />
            </div>
            <div className="field small">
              <label>Validity (days)</label>
              <input
                type="number"
                min="1"
                placeholder="30"
                value={r.days}
                onChange={(e) => updateRow(idx, 'days', e.target.value)}
              />
            </div>
            <div className="field small">
              <label>Custom shortcode</label>
              <input
                type="text"
                placeholder="optional"
                value={r.code}
                onChange={(e) => updateRow(idx, 'code', e.target.value)}
              />
            </div>
            {errors[idx] && <div className="error">{errors[idx]}</div>}
          </div>
        ))}
        <div className="actions">
          <button type="submit">Create Short Links</button>
          <button type="button" className="secondary" onClick={() => navigate('stats')}>View Statistics</button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="card">
          <h3>Created</h3>
          <table>
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short URL</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.shortcode}>
                  <td className="truncate">{r.longUrl}</td>
                  <td>
                    <a href={`#${r.shortcode}`}>{window.location.origin}/#{r.shortcode}</a>
                  </td>
                  <td>{new Date(r.expiryIso).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


