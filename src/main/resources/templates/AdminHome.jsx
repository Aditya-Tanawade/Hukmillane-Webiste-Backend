import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    key: 'tshirt',
    path: '/admin/tshirt',
    emoji: '👕',
    label: 'T-Shirt Orders',
    description: 'View all t-shirt bookings, check payment status, manage distribution, and export records.',
    accent: '#8d0909',
    light: '#fff1f1',
    border: '#f9a8a8',
  },
  {
    key: 'idcard',
    path: '/admin/idcard',
    emoji: '🪪',
    label: 'ID Card Orders',
    description: 'View all ID card bookings, preview cardholder photos, manage distribution, and export records.',
    accent: '#1a4d8d',
    light: '#eff6ff',
    border: '#93c5fd',
  },
]

function AdminHome({ onLogout }) {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-[#fff8ea] px-4 py-10 sm:px-6 lg:py-14">
      {/* Header */}
      <section className="mx-auto max-w-5xl rounded-3xl border border-[#e7c579]/70 bg-[#fffdf7] px-6 py-8 shadow-[0_24px_80px_rgba(93,25,0,.10)] sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#b91111]">Distribution Management</p>
            <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-[#8d0909] sm:text-5xl">Mandal Order Desk</h1>
            <p className="mt-3 text-base leading-7 text-stone-600">Select a section to manage bookings and distribution.</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-fit rounded-full border border-[#8d0909] px-6 py-3 text-sm font-black text-[#8d0909] transition hover:bg-[#8d0909] hover:text-white"
          >
            Logout
          </button>
        </div>
      </section>

      {/* Section cards */}
      <section className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <div
            key={section.key}
            className="group flex flex-col gap-6 rounded-3xl border p-8 shadow-lg transition hover:shadow-2xl sm:p-10"
            style={{ borderColor: section.border, backgroundColor: section.light }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-md"
              style={{ backgroundColor: section.accent }}
            >
              {section.emoji}
            </div>

            <div>
              <h2 className="font-serif text-3xl font-black" style={{ color: section.accent }}>
                {section.label}
              </h2>
              <p className="mt-2 leading-7 text-stone-600">{section.description}</p>
            </div>

            <button
              type="button"
              onClick={() => navigate(section.path)}
              className="mt-auto w-fit rounded-full px-8 py-3 font-black text-white shadow-md transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: section.accent }}
            >
              Go to {section.label} →
            </button>
          </div>
        ))}
      </section>
    </main>
  )
}

export default AdminHome
