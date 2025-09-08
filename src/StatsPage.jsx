import React, { useEffect, useState } from 'react'
import { isExpired, logEvent, readStorage, writeStorage } from './utils.js'

export default function StatsPage({ navigate }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(readStorage())
  }, [])

  function clearAll() {
    if (!confirm('Clear all short URLs and logs?')) return
    localStorage.removeItem('shortUrls')
    localStorage.removeItem('logs')
    setItems([])
    logEvent('stats_cleared')
  }

  function remove(code) {
    const next = items.filter((i) => i.shortcode !== code)
    writeStorage(next)
    setItems(next)
    logEvent('shortcode_deleted', { shortcode: code })
  }

  return (
    <div className="container">
      <h2>Statistics</h2>
      <div className="card">
        <div className="actions">
          <button onClick={() => navigate('home')}>Create More</button>
          <button className="danger" onClick={clearAll}>Clear All</button>
        </div>
        {items.length === 0 ? (
          <p>No short URLs yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Short URL</th>
                <th>Original</th>
                <th>Created</th>
                <th>Expiry</th>
                <th>Clicks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.shortcode} className={isExpired(i.expiryIso) ? 'muted' : ''}>
                  <td>
                    <a href={`#${i.shortcode}`}>{window.location.origin}/#{i.shortcode}</a>
                  </td>
                  <td className="truncate">{i.longUrl}</td>
                  <td>{new Date(i.createdIso).toLocaleString()}</td>
                  <td>{i.expiryIso ? new Date(i.expiryIso).toLocaleString() : '-'}</td>
                  <td>{i.clicks || 0}</td>
                  <td>
                    <button className="secondary" onClick={() => alert(JSON.stringify(i.history || [], null, 2))}>History</button>
                    <button className="danger" onClick={() => remove(i.shortcode)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}


