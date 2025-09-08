export function logEvent(message, data) {
  try {
    const logs = JSON.parse(localStorage.getItem('logs') || '[]')
    logs.push({ message, data, time: new Date().toISOString() })
    localStorage.setItem('logs', JSON.stringify(logs))
  } catch (_) {
    // ignore
  }
}

export function readStorage() {
  try {
    const items = JSON.parse(localStorage.getItem('shortUrls') || '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function writeStorage(items) {
  localStorage.setItem('shortUrls', JSON.stringify(items))
}

export function isValidUrl(url) {
  try {
    const u = new URL(url)
    return !!u.protocol && !!u.hostname
  } catch {
    return false
  }
}

export function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str)
}

export function generateShortcode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function isUniqueShortcode(code, existing) {
  const set = new Set(existing.map((i) => i.shortcode))
  return !set.has(code)
}

export function nowIso() {
  return new Date().toISOString()
}

export function daysFromNowIso(days) {
  const d = new Date()
  d.setDate(d.getDate() + Number(days || 0))
  return d.toISOString()
}

export function isExpired(isoDate) {
  if (!isoDate) return false
  return new Date(isoDate).getTime() < Date.now()
}

export function recordClick(shortcode) {
  const items = readStorage()
  const idx = items.findIndex((i) => i.shortcode === shortcode)
  if (idx === -1) return
  const mockLocation = ['US', 'IN', 'DE', 'SG', 'GB'][Math.floor(Math.random() * 5)]
  const entry = {
    time: nowIso(),
    location: mockLocation,
    source: 'direct',
  }
  const item = items[idx]
  item.clicks = (item.clicks || 0) + 1
  item.history = Array.isArray(item.history) ? [...item.history, entry] : [entry]
  items[idx] = item
  writeStorage(items)
}


