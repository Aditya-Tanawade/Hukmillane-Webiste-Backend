import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  downloadExcel,
  exportIdCardExcelUrl,
  fetchAllIdCardOrders,
  fetchIdCardDashboard,
  markIdCardDelivered,
} from '../api/adminApi'
import { ErrorBox, LoadingSpinner, PageShell, StatCard, Toast } from '../components/AdminUI'
import OrderTable from '../components/OrderTable'

function IdCardDashboard({ onLogout }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const [deliveringId, setDeliveringId] = useState(null)
  const [exporting, setExporting] = useState(false)

  const dashboardQuery = useQuery({
    queryKey: ['idcard-dashboard'],
    queryFn: fetchIdCardDashboard,
  })

  const ordersQuery = useQuery({
    queryKey: ['idcard-orders'],
    queryFn: fetchAllIdCardOrders,
  })

  const deliverMutation = useMutation({
    mutationFn: markIdCardDelivered,
    onMutate: (id) => setDeliveringId(id),
    onSuccess: () => {
      setMessage({ text: 'Delivery status updated successfully.', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['idcard-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['idcard-orders'] })
    },
    onError: (err) => setMessage({ text: err.message || 'Failed to update status.', type: 'error' }),
    onSettled: () => setDeliveringId(null),
  })

  async function handleExport() {
    setExporting(true)
    try {
      await downloadExcel(exportIdCardExcelUrl(), `idcard-orders-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch {
      setMessage({ text: 'Export failed. Please try again.', type: 'error' })
    } finally {
      setExporting(false)
    }
  }

  const stats = dashboardQuery.data

  return (
    <main className="min-h-screen bg-[#eff6ff] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-[#93c5fd]/70 bg-[#f8fbff] px-6 py-8 shadow-[0_24px_80px_rgba(26,77,141,.10)] sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-[#1a4d8d]">ID Card Distribution</p>
              <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-[#1a4d8d] sm:text-5xl">ID Card Orders</h1>
              <p className="mt-3 text-base leading-7 text-stone-600">View all bookings, preview cardholder photos, manage delivery, and export records.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="rounded-full border border-[#1a4d8d] px-5 py-2 text-sm font-black text-[#1a4d8d] hover:bg-[#1a4d8d] hover:text-white transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full bg-stone-100 px-5 py-2 text-sm font-black text-stone-700 hover:bg-stone-200 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {dashboardQuery.isLoading ? (
          <LoadingSpinner text="Loading stats…" />
        ) : dashboardQuery.isError ? (
          <ErrorBox message={dashboardQuery.error?.message} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Payment Success', value: stats?.paymentSuccessCount },
              { label: 'Pending Delivery', value: stats?.pendingDeliveryCount },
              { label: 'Delivered', value: stats?.deliveredCount },
              { label: 'Revenue (₹)', value: stats?.revenue != null ? `₹${stats.revenue}` : undefined },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#93c5fd]/60 bg-white p-5 shadow-md">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1a4d8d]">{s.label}</p>
                <p className="mt-2 font-serif text-4xl font-black text-[#1a4d8d]">{s.value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toast */}
        <Toast message={message.text} type={message.type} />

        {/* Export button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-full bg-[#1a4d8d] px-7 py-3 font-black text-white shadow-md transition hover:bg-[#2563eb] disabled:opacity-60"
          >
            {exporting ? 'Exporting…' : '⬇ Export to Excel'}
          </button>
        </div>

        {/* Orders table */}
        {ordersQuery.isLoading ? (
          <LoadingSpinner text="Loading orders…" />
        ) : ordersQuery.isError ? (
          <ErrorBox message={ordersQuery.error?.message} />
        ) : (
          <OrderTable
            type="idcard"
            orders={ordersQuery.data || []}
            onDeliver={(id) => deliverMutation.mutate(id)}
            deliveringId={deliveringId}
          />
        )}
      </div>
    </main>
  )
}

export default IdCardDashboard
