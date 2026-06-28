import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  downloadExcel,
  exportTshirtExcelUrl,
  fetchAllTshirtOrders,
  fetchTshirtDashboard,
  markTshirtDelivered,
} from '../api/adminApi'
import { ErrorBox, LoadingSpinner, PageShell, StatCard, Toast } from '../components/AdminUI'
import OrderTable from '../components/OrderTable'

function TshirtDashboard({ onLogout }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState({ text: '', type: 'info' })
  const [deliveringId, setDeliveringId] = useState(null)
  const [exporting, setExporting] = useState(false)

  const dashboardQuery = useQuery({
    queryKey: ['tshirt-dashboard'],
    queryFn: fetchTshirtDashboard,
  })

  const ordersQuery = useQuery({
    queryKey: ['tshirt-orders'],
    queryFn: fetchAllTshirtOrders,
  })

  const deliverMutation = useMutation({
    mutationFn: markTshirtDelivered,
    onMutate: (id) => setDeliveringId(id),
    onSuccess: () => {
      setMessage({ text: 'Delivery status updated successfully.', type: 'success' })
      queryClient.invalidateQueries({ queryKey: ['tshirt-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['tshirt-orders'] })
    },
    onError: (err) => setMessage({ text: err.message || 'Failed to update status.', type: 'error' }),
    onSettled: () => setDeliveringId(null),
  })

  async function handleExport() {
    setExporting(true)
    try {
      await downloadExcel(exportTshirtExcelUrl(), `tshirt-orders-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch {
      setMessage({ text: 'Export failed. Please try again.', type: 'error' })
    } finally {
      setExporting(false)
    }
  }

  const stats = dashboardQuery.data

  return (
    <main className="min-h-screen bg-[#fff8ea] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <PageShell
          eyebrow="T-Shirt Distribution"
          title="T-Shirt Orders"
          subtitle="View all bookings, manage delivery status, and export records."
          action={
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="rounded-full border border-[#8d0909] px-5 py-2 text-sm font-black text-[#8d0909] hover:bg-[#8d0909] hover:text-white transition"
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
          }
        />

        {/* Stats */}
        {dashboardQuery.isLoading ? (
          <LoadingSpinner text="Loading stats…" />
        ) : dashboardQuery.isError ? (
          <ErrorBox message={dashboardQuery.error?.message} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Payment Success" value={stats?.paymentSuccessCount ?? '—'} />
            <StatCard label="Pending Delivery" value={stats?.pendingDeliveryCount ?? '—'} />
            <StatCard label="Delivered" value={stats?.deliveredCount ?? '—'} />
            <StatCard label="Revenue (₹)" value={stats?.revenue != null ? `₹${stats.revenue}` : '—'} accent />
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
            className="rounded-full bg-[#b91111] px-7 py-3 font-black text-white shadow-md transition hover:bg-[#8d0909] disabled:opacity-60"
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
            type="tshirt"
            orders={ordersQuery.data || []}
            onDeliver={(id) => deliverMutation.mutate(id)}
            deliveringId={deliveringId}
          />
        )}
      </div>
    </main>
  )
}

export default TshirtDashboard
