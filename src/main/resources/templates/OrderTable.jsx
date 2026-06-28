import { useMemo, useState } from 'react'
import { Badge, DeliveryBadge } from './AdminUI'

// ─── Date helpers ──────────────────────────────────────────────────────────────
function fmt(value) {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString('en-IN')
}

function fmtDate(value) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

// ─── Image helper (base64 bytes from Spring) ──────────────────────────────────
function photoSrc(entity) {
  if (!entity.imageData) return null
  const type = entity.imageType || 'image/jpeg'
  if (typeof entity.imageData === 'string') {
    return `data:${type};base64,${entity.imageData}`
  }
  return null
}

// ─── T-Shirt size summary ─────────────────────────────────────────────────────
function sizeSummary(sizeQuantities) {
  if (!Array.isArray(sizeQuantities) || !sizeQuantities.length) return '—'
  return sizeQuantities.map((s) => `${s.size} × ${s.quantity}`).join(', ')
}

// ─── Search / filter ──────────────────────────────────────────────────────────
function applyFilters(orders, { query, dateFrom, dateTo, deliveryStatus }) {
  return orders.filter((o) => {
    if (deliveryStatus !== 'all') {
      const isDelivered = String(o.deliveryStatus).toLowerCase() === 'delivered'
      if (deliveryStatus === 'delivered' && !isDelivered) return false
      if (deliveryStatus === 'pending' && isDelivered) return false
    }

    if (dateFrom) {
      const d = fmtDate(o.createdAt)
      if (d < dateFrom) return false
    }
    if (dateTo) {
      const d = fmtDate(o.createdAt)
      if (d > dateTo) return false
    }

    if (query) {
      const q = query.toLowerCase()
      const haystack = [
        o.bookingId,
        o.name,
        o.email,
        o.phoneNumber,
        o.razorpayOrderId,
        o.razorpayPaymentId,
        o.orderStatus,
        o.idCardHolderName,
        fmtDate(o.createdAt),
        ...(o.sizeQuantities || []).map((s) => s.size),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }

    return true
  })
}

// ─── T-Shirt table row ────────────────────────────────────────────────────────
function TshirtRow({ order, onDeliver, delivering }) {
  return (
    <tr className="border-b border-[#ead9b3] align-top odd:bg-white even:bg-[#fffaf0]">
      <td className="px-4 py-4">
        <strong className="text-[#8d0909]">{order.bookingId}</strong>
        <div className="mt-1 text-xs text-stone-500">{order.razorpayOrderId}</div>
      </td>
      <td className="px-4 py-4">{fmt(order.createdAt)}</td>
      <td className="px-4 py-4">
        <strong>{order.name}</strong>
        <div className="mt-1 text-xs text-stone-500">{order.email}</div>
      </td>
      <td className="px-4 py-4">
        <div className="font-bold">{order.phoneNumber}</div>
      </td>
      <td className="px-4 py-4">
        <div className="font-medium">{sizeSummary(order.sizeQuantities)}</div>
        <div className="mt-1 text-xs text-stone-500">Total: {order.totalQuantity}</div>
      </td>
      <td className="px-4 py-4">
        <div className="font-black text-[#8d0909]">₹{order.amount}</div>
        <div className="mt-1">
          <Badge status={order.orderStatus || 'paid'} />
        </div>
        <div className="mt-1 text-xs text-stone-500">{order.razorpayPaymentId}</div>
      </td>
      <td className="px-4 py-4">
        <DeliveryBadge delivered={String(order.deliveryStatus).toLowerCase() === 'delivered'} />
      </td>
      <td className="px-4 py-4">
        {String(order.deliveryStatus).toLowerCase() === 'delivered' ? (
          <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">✓ Done</span>
        ) : (
          <button
            type="button"
            disabled={delivering}
            onClick={() => onDeliver(order.bookingId)}
            className="rounded-full bg-[#8d0909] px-4 py-2 text-xs font-black text-white shadow transition hover:bg-[#b91111] disabled:opacity-60"
          >
            {delivering ? 'Updating…' : 'Mark Delivered'}
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── ID Card table row ────────────────────────────────────────────────────────
function IdCardRow({ order, onDeliver, delivering }) {
  const src = photoSrc(order)
  return (
    <tr className="border-b border-[#ead9b3] align-top odd:bg-white even:bg-[#fffaf0]">
      <td className="px-4 py-4">
        <strong className="text-[#1a4d8d]">{order.bookingId}</strong>
        <div className="mt-1 text-xs text-stone-500">{order.razorpayOrderId}</div>
      </td>
      <td className="px-4 py-4">{fmt(order.createdAt)}</td>
      <td className="px-4 py-4">
        {src ? (
          <a href={src} target="_blank" rel="noreferrer">
            <img src={src} alt={order.idCardHolderName} className="h-20 w-16 rounded-md border border-[#d9bd79] object-cover shadow-sm" />
            <span className="mt-1 block text-center text-xs font-black text-[#1a4d8d]">View</span>
          </a>
        ) : (
          <span className="text-xs font-bold text-stone-400">No photo</span>
        )}
      </td>
      <td className="px-4 py-4">
        <strong>{order.idCardHolderName || '—'}</strong>
      </td>
      <td className="px-4 py-4">
        <strong>{order.name}</strong>
        <div className="mt-1 text-xs text-stone-500">{order.email}</div>
      </td>
      <td className="px-4 py-4">
        <div className="font-bold">{order.phoneNumber}</div>
      </td>
      <td className="px-4 py-4">
        <div className="font-black text-[#1a4d8d]">₹{order.amount}</div>
        <div className="mt-1">
          <Badge status={order.orderStatus || 'paid'} />
        </div>
        <div className="mt-1 text-xs text-stone-500">{order.razorpayPaymentId}</div>
      </td>
      <td className="px-4 py-4">
        <DeliveryBadge delivered={String(order.deliveryStatus).toLowerCase() === 'delivered'} />
      </td>
      <td className="px-4 py-4">
        {String(order.deliveryStatus).toLowerCase() === 'delivered' ? (
          <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">✓ Done</span>
        ) : (
          <button
            type="button"
            disabled={delivering}
            onClick={() => onDeliver(order.bookingId)}
            className="rounded-full bg-[#1a4d8d] px-4 py-2 text-xs font-black text-white shadow transition hover:bg-[#2563eb] disabled:opacity-60"
          >
            {delivering ? 'Updating…' : 'Mark Delivered'}
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── Main OrderTable component ────────────────────────────────────────────────
function OrderTable({ orders = [], type = 'tshirt', onDeliver, deliveringId }) {
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deliveryStatus, setDeliveryStatus] = useState('all')

  const filtered = useMemo(
    () => applyFilters(orders, { query, dateFrom, dateTo, deliveryStatus }),
    [orders, query, dateFrom, dateTo, deliveryStatus],
  )

  const isTshirt = type === 'tshirt'
  const accent = isTshirt ? '#8d0909' : '#1a4d8d'

  return (
    <div>
      {/* ─── Search & Filters ─── */}
      <div className="mt-6 space-y-3 rounded-2xl border border-[#e7c579]/70 bg-white p-4 shadow-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isTshirt
              ? 'Search by name, email, phone, booking ID, payment ID, size…'
              : 'Search by name, email, phone, booking ID, cardholder name…'
          }
          className="w-full rounded-xl border border-[#d9bd79] bg-[#fffdf7] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b91111]/20"
        />
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-black text-stone-600">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-[#d9bd79] bg-[#fffdf7] px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-black text-stone-600">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-[#d9bd79] bg-[#fffdf7] px-3 py-2 text-sm outline-none"
            />
          </div>
          <select
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value)}
            className="rounded-lg border border-[#d9bd79] bg-[#fffdf7] px-3 py-2 text-sm font-bold outline-none"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending Only</option>
            <option value="delivered">Delivered Only</option>
          </select>
          {(query || dateFrom || dateTo || deliveryStatus !== 'all') && (
            <button
              type="button"
              onClick={() => { setQuery(''); setDateFrom(''); setDateTo(''); setDeliveryStatus('all') }}
              className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-black text-stone-600 hover:bg-stone-50"
            >
              Clear filters
            </button>
          )}
        </div>
        <p className="text-xs font-bold text-stone-500">
          Showing {filtered.length} of {orders.length} orders
        </p>
      </div>

      {/* ─── Table ─── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e7c579]/70 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm" style={{ minWidth: isTshirt ? '900px' : '1100px' }}>
            <thead style={{ backgroundColor: accent }} className="text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Booking ID</th>
                <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Date</th>
                {!isTshirt && <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Photo</th>}
                {!isTshirt && <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Name on ID</th>}
                <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Customer</th>
                <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Phone</th>
                {isTshirt && <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Sizes / Qty</th>}
                <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Payment</th>
                <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Status</th>
                <th className="whitespace-nowrap px-4 py-4 text-xs font-black uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) =>
                isTshirt ? (
                  <TshirtRow
                    key={order.bookingId}
                    order={order}
                    onDeliver={onDeliver}
                    delivering={deliveringId === order.bookingId}
                  />
                ) : (
                  <IdCardRow
                    key={order.bookingId}
                    order={order}
                    onDeliver={onDeliver}
                    delivering={deliveringId === order.bookingId}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-10 text-center font-bold text-stone-500">
            {orders.length === 0 ? 'No orders found.' : 'No orders match your filters.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default OrderTable
