import React, { useEffect, useMemo, useState } from 'react'
import ShortenerPage from './ShortenerPage.jsx'
import StatsPage from './StatsPage.jsx'
import { isExpired, logEvent, readStorage, recordClick } from './utils.js'

export default function App() {
  const [page, setPage] = useState('home')

  // hash-based pseudo routing to support direct navigation
  useEffect(() => {
    function syncPageFromHash() {
      const hash = (window.location.hash || '').replace('#', '')
      setPage(hash || 'home')
    }
    window.addEventListener('hashchange', syncPageFromHash)
    syncPageFromHash()
    return () => window.removeEventListener('hashchange', syncPageFromHash)
  }, [])

  useEffect(() => {
    if (!page || page === 'home' || page === 'stats') return
    // treat page value as shortcode
    const items = readStorage()
    const match = items.find((i) => i.shortcode === page)
    if (!match) {
      logEvent('redirect_not_found', { shortcode: page })
      alert('Short link not found')
      window.location.hash = '#home'
      return
    }
    if (isExpired(match.expiryIso)) {
      logEvent('redirect_expired', { shortcode: page })
      alert('This link has expired')
      window.location.hash = '#home'
      return
    }
    recordClick(page)
    logEvent('redirect_success', { shortcode: page, to: match.longUrl })
    window.location.href = match.longUrl
  }, [page])

  const content = useMemo(() => {
    if (page === 'stats') return <StatsPage navigate={setHash} />
    if (page === 'home') return <ShortenerPage navigate={setHash} />
    return (
      <div className="container">
        <p>Redirecting...</p>
      </div>
    )
  }, [page])

  function setHash(next) {
    window.location.hash = `#${next}`
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={() => setHash('home')}>URL Shortener</div>
        <nav className="nav">
          <button className={page === 'home' ? 'active' : ''} onClick={() => setHash('home')}>Shortener</button>
          <button className={page === 'stats' ? 'active' : ''} onClick={() => setHash('stats')}>Statistics</button>
        </nav>
      </header>
      <main>{content}</main>
    </div>
  )
}


