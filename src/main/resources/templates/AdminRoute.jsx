import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminHome from './pages/AdminHome'
import AdminLogin from './pages/AdminLogin'
import IdCardDashboard from './pages/IdCardDashboard'
import TshirtDashboard from './pages/TshirtDashboard'

const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

// ─── Inner app (has access to QueryClient) ────────────────────────────────────
function AdminApp() {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '')

  // Listen for session-expiry event dispatched by the API layer
  useEffect(() => {
    function handleExpired() {
      setToken('')
      queryClient.clear()
    }
    window.addEventListener('admin-session-expired', handleExpired)
    return () => window.removeEventListener('admin-session-expired', handleExpired)
  }, [queryClient])

  function handleLogin(newToken) {
    setToken(newToken)
  }

  function handleLogout() {
    localStorage.removeItem('adminToken')
    setToken('')
    queryClient.clear()
  }

  // Not logged in → always show login
  if (!token) {
    return <AdminLogin onSuccess={handleLogin} />
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminHome onLogout={handleLogout} />} />
      <Route path="/admin/tshirt" element={<TshirtDashboard onLogout={handleLogout} />} />
      <Route path="/admin/idcard" element={<IdCardDashboard onLogout={handleLogout} />} />
      {/* Catch-all → redirect to admin home */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

// ─── Root export: provides QueryClient + Router ───────────────────────────────
function AdminRoute() {
  return (
    <QueryClientProvider client={adminQueryClient}>
      <BrowserRouter>
        <AdminApp />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default AdminRoute
