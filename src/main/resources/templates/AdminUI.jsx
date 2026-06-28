// ─── Shared UI primitives ─────────────────────────────────────────────────────

export function StatCard({ label, value, accent = false }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-md ${accent ? 'border-amber-300 bg-[#8d0909] text-white' : 'border-[#e7c579]/60 bg-white'}`}>
      <p className={`text-xs font-black uppercase tracking-[0.18em] ${accent ? 'text-amber-300' : 'text-[#a31616]'}`}>{label}</p>
      <p className={`mt-2 font-serif text-4xl font-black ${accent ? 'text-white' : 'text-[#8d0909]'}`}>{value ?? '—'}</p>
    </div>
  )
}

export function Badge({ status }) {
  const positive = ['paid', 'processing', 'ready', 'delivered', 'collected', 'completed', 'distributed', 'success'].includes(
    String(status).toLowerCase(),
  )
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {status}
    </span>
  )
}

export function DeliveryBadge({ delivered }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${delivered ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
      {delivered ? 'Delivered' : 'Pending'}
    </span>
  )
}

export function Toast({ message, type = 'info' }) {
  if (!message) return null
  const colors = {
    info: 'bg-amber-50 text-[#8d0909]',
    success: 'bg-green-50 text-green-800',
    error: 'bg-red-50 text-red-800',
  }
  return (
    <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${colors[type] || colors.info}`}>
      {message}
    </p>
  )
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e7c579] border-t-[#8d0909]" />
      <p className="font-bold text-stone-500">{text}</p>
    </div>
  )
}

export function ErrorBox({ message }) {
  return (
    <div className="mt-8 rounded-xl bg-red-50 p-6 text-center">
      <p className="font-bold text-red-800">{message || 'Something went wrong.'}</p>
    </div>
  )
}

export function PageShell({ eyebrow, title, subtitle, action }) {
  return (
    <div className="rounded-3xl border border-[#e7c579]/70 bg-[#fffdf7] px-5 py-8 shadow-[0_24px_80px_rgba(93,25,0,.10)] sm:px-8 lg:px-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#b91111]">{eyebrow}</p>
          <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-[#8d0909] sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
