// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function authHeaders() {
  const token = localStorage.getItem('adminToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  })

  if (res.status === 401) {
    localStorage.removeItem('adminToken')
    window.dispatchEvent(new Event('admin-session-expired'))
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Request failed: ${res.status}`)
  }

  return res
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function loginAdmin({ email, password }) {
  const res = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Login failed')
  }
  return res.json()
}

// ─── T-Shirt ──────────────────────────────────────────────────────────────────
export async function fetchTshirtDashboard() {
  const res = await request('/admin/tshirt/dashboard')
  return res.json()
}

export async function fetchAllTshirtOrders() {
  const res = await request('/admin/tshirt/pending-orders')
  return res.json()
}

export async function markTshirtDelivered(bookingId) {
  const res = await request(`/admin/tshirt/delivered/${bookingId}`, { method: 'PUT' })
  return res.json()
}

export function exportTshirtExcelUrl() {
  return `${BASE}/admin/tshirt/export/excel`
}

// ─── ID Card ──────────────────────────────────────────────────────────────────
export async function fetchIdCardDashboard() {
  const res = await request('/admin/idcard/dashboard')
  return res.json()
}

export async function fetchAllIdCardOrders() {
  const res = await request('/admin/idcard/pending-orders')
  return res.json()
}

export async function markIdCardDelivered(bookingId) {
  const res = await request(`/admin/idcard/delivered/${bookingId}`, { method: 'PUT' })
  return res.json()
}

export function exportIdCardExcelUrl() {
  return `${BASE}/admin/idcard/export/excel`
}

// ─── Authenticated download helper ───────────────────────────────────────────
export async function downloadExcel(url, filename) {
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
