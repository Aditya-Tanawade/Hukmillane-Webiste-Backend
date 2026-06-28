import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { loginAdmin } from '../api/adminApi'
import { Toast } from '../components/AdminUI'

function AdminLogin({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () => loginAdmin(form),
    onSuccess: (data) => {
      const token = data.token || data.data?.token
      if (!token) {
        setMessage('Login succeeded but no token was returned.')
        return
      }
      localStorage.setItem('adminToken', token)
      onSuccess(token)
    },
    onError: (err) => setMessage(err.message || 'Login failed.'),
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8ea] px-4 py-12">
      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        {/* Left panel */}
        <div className="rounded-3xl bg-[#8d0909] p-8 text-white shadow-2xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">Secure Access</p>
          <h2 className="mt-4 font-serif text-4xl font-black leading-tight">Mandal Order Desk</h2>
          <p className="mt-4 leading-7 text-red-100/80">
            Only authorized Mandal members can view customer orders, ID-card details, and distribution records.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-200">Admin Only</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
        </div>

        {/* Right panel – login form */}
        <div className="rounded-3xl border border-[#e7c579]/70 bg-white p-7 shadow-xl sm:p-9">
          <h2 className="font-serif text-3xl font-black text-[#8d0909]">Admin Login</h2>
          <p className="mt-1 text-sm text-stone-500">Enter your credentials to continue</p>

          <div className="mt-7 space-y-4">
            <label className="block text-sm font-black text-stone-700">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-2 w-full rounded-xl border border-[#d9bd79] bg-[#fffdf7] px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-[#b91111]/25"
                placeholder="admin@mandal.com"
              />
            </label>

            <label className="block text-sm font-black text-stone-700">
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && mutation.mutate()}
                className="mt-2 w-full rounded-xl border border-[#d9bd79] bg-[#fffdf7] px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-[#b91111]/25"
                placeholder="••••••••"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={mutation.isPending || !form.email || !form.password}
            onClick={() => { setMessage(''); mutation.mutate() }}
            className="mt-6 w-full rounded-full bg-[#b91111] px-6 py-3 font-black text-white shadow-lg transition hover:bg-[#8d0909] disabled:opacity-60"
          >
            {mutation.isPending ? 'Signing in…' : 'Login'}
          </button>

          <Toast message={message} type="error" />
        </div>
      </div>
    </main>
  )
}

export default AdminLogin
