import { useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const TSHIRT_SIZES = Array.from(
  { length: (58 - 20) / 2 + 1 },
  (_, i) => String(20 + i * 2)
); // ["20","22",...,"58"]

const BACKEND_URL = "http://localhost:8080";

const PRODUCTS = [
  {
    id: "tshirt",
    type: "tshirt",
    name: "Festival T-Shirt",
    description:
      "Premium cotton festival T-shirt. Available in sizes 20 to 58. Price is uniform across all sizes.",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    badge: "Most Popular",
  },
  {
    id: "idcard",
    type: "idcard",
    name: "Volunteer ID Card",
    description:
      "Official laminated ID card for registered volunteers. One size.",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    badge: "Volunteers Only",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Razorpay checkout helper ──────────────────────────────────────────────────
function openRazorpay(options) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded"));
      return;
    }
    const rzp = new window.Razorpay({
      ...options,
      handler: resolve,
    });
    rzp.on("payment.failed", reject);
    rzp.open();
  });
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function createOrder(payload) {
  const res = await fetch(`${BACKEND_URL}/createOrder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Shop() {
  // Which product's modal is open: null | "tshirt" | "idcard"
  const [activeModal, setActiveModal] = useState(null);
  // Per-product carts: { tshirt: [...], idcard: [...] }
  const [carts, setCarts] = useState({ tshirt: [], idcard: [] });

  const activeProduct = PRODUCTS.find((p) => p.id === activeModal);

  function cartTotal(type) {
    const product = PRODUCTS.find((p) => p.type === type);
    return carts[type].reduce((sum, row) => sum + row.quantity * product.price, 0);
  }

  function cartCount(type) {
    return carts[type].reduce((sum, r) => sum + r.quantity, 0);
  }

  function handleAddToCart(type, rows) {
    setCarts((prev) => {
      const existing = [...prev[type]];
      rows.forEach(({ size, quantity }) => {
        const idx = existing.findIndex((r) => r.size === size);
        if (idx >= 0) {
          existing[idx] = { ...existing[idx], quantity: existing[idx].quantity + quantity };
        } else {
          existing.push({ size, quantity });
        }
      });
      return { ...prev, [type]: existing };
    });
    setActiveModal(null);
  }

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎪</span>
            <div>
              <div style={styles.logoTitle}>Festival Store</div>
              <div style={styles.logoSub}>Official Merchandise</div>
            </div>
          </div>
          <div style={styles.cartBadges}>
            {PRODUCTS.map((p) => (
              <CartBadge
                key={p.id}
                label={p.name}
                count={cartCount(p.type)}
                total={cartTotal(p.type)}
                product={p}
                rows={carts[p.type]}
                onUpdate={(rows) => setCarts((prev) => ({ ...prev, [p.type]: rows }))}
                onClear={() => setCarts((prev) => ({ ...prev, [p.type]: [] }))}
              />
            ))}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.heroEyebrow}>✦ Limited Edition 2025 ✦</p>
          <h1 style={styles.heroTitle}>Get Your Festival Gear</h1>
          <p style={styles.heroSub}>
            Official merchandise for devotees and volunteers. Quality guaranteed, delivered to your doorstep.
          </p>
        </div>
        <div style={styles.heroDeco} />
      </section>

      {/* ── Product Grid ── */}
      <main style={styles.main}>
        <div style={styles.grid}>
          {PRODUCTS.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              cartCount={cartCount(p.type)}
              onAdd={() => setActiveModal(p.id)}
            />
          ))}
        </div>
      </main>

      {/* ── Modal ── */}
      {activeModal && activeProduct && (
        <OrderModal
          product={activeProduct}
          onClose={() => setActiveModal(null)}
          onConfirm={(rows) => handleAddToCart(activeProduct.type, rows)}
        />
      )}
    </div>
  );
}

// ── Cart Badge (header) ───────────────────────────────────────────────────────
function CartBadge({ label, count, total, product, rows, onUpdate, onClear }) {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phoneNumber: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  if (count === 0) return null;

  function handleQtyChange(size, qty) {
    const updated = rows
      .map((r) => (r.size === size ? { ...r, quantity: Math.max(0, qty) } : r))
      .filter((r) => r.quantity > 0);
    onUpdate(updated);
  }

  async function handleCheckout(e) {
    e.preventDefault();
    if (!customer.name || !customer.phoneNumber) {
      setStatus("Name and phone are required.");
      return;
    }
    try {
      setLoading(true);
      setStatus("Creating order…");

      const totalAmount = rows.reduce((s, r) => s + r.quantity * product.price, 0);
      const payload = {
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        amount: totalAmount,
        sizeQuantities: rows.map((r) => ({ size: r.size, quantity: r.quantity })),
        totalTshirtCount: rows.reduce((s, r) => s + r.quantity, 0),
      };

      const order = await createOrder(payload);

      const payment = await openRazorpay({
        key: order.razorpayKeyId || "rzp_test_Szs3bpXCvig4pQ",
        amount: order.amount * 100,
        currency: "INR",
        name: "Festival Store",
        description: `Order for ${label}`,
        order_id: order.razorpayOrderId,
        prefill: { name: customer.name, email: customer.email },
        theme: { color: "#c62828" },
        callback_url: `${BACKEND_URL}/paymentCallback`,
      });

      setStatus(`✅ Payment successful! Payment ID: ${payment.razorpay_payment_id}`);
      onClear();
    } catch (err) {
      setStatus(`❌ ${err.message || "Payment failed. Please try again."}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button style={styles.cartBtn} onClick={() => setOpen((o) => !o)}>
        <span style={styles.cartBtnIcon}>🛒</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{label.split(" ")[1]}</span>
        <span style={styles.cartBtnCount}>{count}</span>
      </button>

      {open && (
        <div style={styles.cartDropdown}>
          <div style={styles.cartDropdownHeader}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{label}</span>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          {/* Items */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0e6d3" }}>
            {rows.map((r) => (
              <div key={r.size} style={styles.cartRow}>
                <span style={styles.cartRowSize}>{r.size === "Standard" ? "Standard" : `Size ${r.size}`}</span>
                <div style={styles.stepper}>
                  <button style={styles.stepBtn} onClick={() => handleQtyChange(r.size, r.quantity - 1)}>−</button>
                  <span style={styles.stepNum}>{r.quantity}</span>
                  <button style={styles.stepBtn} onClick={() => handleQtyChange(r.size, r.quantity + 1)}>+</button>
                </div>
                <span style={styles.cartRowAmt}>{money(r.quantity * product.price)}</span>
              </div>
            ))}
            <div style={styles.cartTotal}>
              <span>Total</span>
              <span style={{ color: "#c62828", fontWeight: 800 }}>
                {money(rows.reduce((s, r) => s + r.quantity * product.price, 0))}
              </span>
            </div>
          </div>

          {/* Customer form */}
          <form onSubmit={handleCheckout} style={{ padding: "14px 16px" }}>
            <p style={styles.formLabel}>Your Details</p>
            {[
              { field: "name", placeholder: "Full Name *", type: "text" },
              { field: "phoneNumber", placeholder: "Phone Number *", type: "tel" },
              { field: "email", placeholder: "Email (optional)", type: "email" },
            ].map(({ field, placeholder, type }) => (
              <input
                key={field}
                type={type}
                placeholder={placeholder}
                value={customer[field]}
                onChange={(e) => setCustomer({ ...customer, [field]: e.target.value })}
                style={styles.input}
                required={field !== "email"}
              />
            ))}
            <button
              type="submit"
              disabled={loading || rows.length === 0}
              style={{ ...styles.payBtn, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Processing…" : `Pay ${money(rows.reduce((s, r) => s + r.quantity * product.price, 0))}`}
            </button>
            {status && (
              <p style={{
                marginTop: 10, fontSize: 12, fontWeight: 700, padding: "8px 10px",
                borderRadius: 8,
                background: status.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
                color: status.startsWith("✅") ? "#166534" : "#991b1b",
              }}>
                {status}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, cartCount, onAdd }) {
  return (
    <article style={styles.card}>
      <div style={styles.cardImgWrap}>
        <img src={product.image} alt={product.name} style={styles.cardImg} />
        <span style={styles.cardBadge}>{product.badge}</span>
        <span style={styles.cardPrice}>{money(product.price)}</span>
      </div>
      <div style={styles.cardBody}>
        <h2 style={styles.cardTitle}>{product.name}</h2>
        <p style={styles.cardDesc}>{product.description}</p>
        {product.type === "tshirt" && (
          <p style={styles.sizeHint}>📏 Sizes 20 – 58 (step 2) · Same price for all</p>
        )}
        <button onClick={onAdd} style={styles.addBtn}>
          {cartCount > 0 ? `🛒 Add More (${cartCount} in cart)` : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

// ── Order Modal ───────────────────────────────────────────────────────────────
function OrderModal({ product, onClose, onConfirm }) {
  const isTshirt = product.type === "tshirt";
  const sizes = isTshirt ? TSHIRT_SIZES : ["Standard"];

  const [rows, setRows] = useState([{ size: sizes[0], quantity: 1 }]);

  function update(i, field, value) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { size: sizes[0], quantity: 1 }]);
  }

  function removeRow(i) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalAmt = totalQty * product.price;

  // Merge rows with duplicate sizes before confirming
  function confirm() {
    const merged = {};
    rows.forEach(({ size, quantity }) => {
      merged[size] = (merged[size] || 0) + quantity;
    });
    onConfirm(Object.entries(merged).map(([size, quantity]) => ({ size, quantity })));
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>{product.name}</h2>
            <p style={styles.modalPrice}>{money(product.price)} per piece · all sizes same price</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.modalBody}>
          <p style={styles.sectionLabel}>
            {isTshirt ? "Select Sizes & Quantities" : "Select Quantity"}
          </p>

          {/* Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((row, i) => (
              <div key={i} style={styles.modalRow}>
                {/* Size selector — only show for tshirt */}
                {isTshirt && (
                  <select
                    value={row.size}
                    onChange={(e) => update(i, "size", e.target.value)}
                    style={styles.sizeSelect}
                  >
                    {sizes.map((s) => (
                      <option key={s} value={s}>{`Size ${s}`}</option>
                    ))}
                  </select>
                )}

                {/* Stepper */}
                <div style={styles.stepper}>
                  <button
                    type="button"
                    style={styles.stepBtn}
                    onClick={() => update(i, "quantity", Math.max(1, row.quantity - 1))}
                  >−</button>
                  <span style={styles.stepNum}>{row.quantity}</span>
                  <button
                    type="button"
                    style={styles.stepBtn}
                    onClick={() => update(i, "quantity", row.quantity + 1)}
                  >+</button>
                </div>

                {/* Row subtotal */}
                <span style={styles.rowAmt}>{money(row.quantity * product.price)}</span>

                {/* Remove */}
                {rows.length > 1 && (
                  <button
                    type="button"
                    style={styles.removeRowBtn}
                    onClick={() => removeRow(i)}
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          {/* Add another size row */}
          {isTshirt && (
            <button type="button" onClick={addRow} style={styles.addSizeBtn}>
              + Add another size
            </button>
          )}

          {/* Summary */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Pieces</span>
              <span style={{ fontWeight: 700 }}>{totalQty}</span>
            </div>
            <div style={{ ...styles.summaryRow, borderTop: "1px solid #e7c579", paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 17 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 17, color: "#c62828" }}>{money(totalAmt)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={totalQty === 0}
            style={styles.confirmBtn}
          >
            Add to Cart — {money(totalAmt)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #fff8f0 0%, #fff3e0 50%, #fce4ec 100%)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  // Header
  header: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #f5deb3",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 20px rgba(198,40,40,0.08)",
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: { fontSize: 32 },
  logoTitle: { fontSize: 18, fontWeight: 900, color: "#b71c1c", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 11, fontWeight: 600, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.08em" },
  cartBadges: { display: "flex", gap: 10, flexWrap: "wrap" },
  cartBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#b71c1c", color: "#fff",
    border: "none", borderRadius: 50,
    padding: "8px 16px",
    cursor: "pointer", fontSize: 13, fontWeight: 700,
    boxShadow: "0 4px 14px rgba(183,28,28,0.3)",
    transition: "transform 0.15s",
  },
  cartBtnIcon: { fontSize: 16 },
  cartBtnCount: {
    background: "#fff", color: "#b71c1c",
    borderRadius: "50%", width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 900,
  },
  // Cart dropdown
  cartDropdown: {
    position: "absolute", right: 0, top: "calc(100% + 10px)",
    width: 340, background: "#fff",
    borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    border: "1px solid #f5deb3", zIndex: 200,
    overflow: "hidden",
  },
  cartDropdownHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px", borderBottom: "1px solid #f0e6d3",
    background: "#fff9f0",
  },
  cartRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 0", borderBottom: "1px solid #faf5ee",
  },
  cartRowSize: { flex: 1, fontSize: 13, fontWeight: 700, color: "#424242" },
  cartRowAmt: { fontSize: 13, fontWeight: 800, color: "#b71c1c", minWidth: 60, textAlign: "right" },
  cartTotal: {
    display: "flex", justifyContent: "space-between",
    paddingTop: 10, marginTop: 4, fontWeight: 700, fontSize: 15,
  },
  // Hero
  hero: {
    position: "relative",
    background: "linear-gradient(135deg, #b71c1c 0%, #880e0e 60%, #4a0000 100%)",
    color: "#fff",
    padding: "60px 24px",
    overflow: "hidden",
    textAlign: "center",
  },
  heroDeco: {
    position: "absolute", top: -60, right: -60,
    width: 300, height: 300,
    borderRadius: "50%",
    background: "rgba(255,200,0,0.12)",
    pointerEvents: "none",
  },
  heroContent: { position: "relative", maxWidth: 640, margin: "0 auto" },
  heroEyebrow: {
    fontSize: 12, fontWeight: 800, letterSpacing: "0.25em",
    color: "#ffcc80", textTransform: "uppercase", marginBottom: 12,
  },
  heroTitle: {
    fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900,
    margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-1px",
  },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 },
  // Main / Grid
  main: { maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 28,
  },
  // Card
  card: {
    background: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(183,28,28,0.08)",
    border: "1px solid rgba(245,222,179,0.6)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardImgWrap: { position: "relative", overflow: "hidden" },
  cardImg: { width: "100%", height: 240, objectFit: "cover", display: "block" },
  cardBadge: {
    position: "absolute", top: 14, left: 14,
    background: "#b71c1c", color: "#fff",
    fontSize: 11, fontWeight: 800, padding: "4px 12px",
    borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.06em",
  },
  cardPrice: {
    position: "absolute", top: 14, right: 14,
    background: "rgba(255,255,255,0.95)",
    color: "#b71c1c", fontWeight: 900, fontSize: 18,
    padding: "4px 14px", borderRadius: 50,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  cardBody: { padding: "22px 22px 26px" },
  cardTitle: { fontSize: 24, fontWeight: 900, color: "#212121", margin: "0 0 8px" },
  cardDesc: { fontSize: 14, color: "#616161", lineHeight: 1.7, margin: "0 0 10px" },
  sizeHint: {
    fontSize: 12, fontWeight: 700, color: "#795548",
    background: "#fff8e1", borderRadius: 8, padding: "6px 10px",
    display: "inline-block", marginBottom: 16,
  },
  addBtn: {
    width: "100%", background: "#b71c1c", color: "#fff",
    border: "none", borderRadius: 50,
    padding: "13px 20px", fontSize: 15, fontWeight: 800,
    cursor: "pointer", letterSpacing: "0.02em",
    boxShadow: "0 6px 20px rgba(183,28,28,0.25)",
    transition: "background 0.15s, transform 0.15s",
  },
  // Modal
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    zIndex: 300,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 22,
    width: "100%", maxWidth: 460,
    boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "20px 22px", borderBottom: "1px solid #f0e6d3",
    background: "#fff9f0",
  },
  modalTitle: { fontSize: 20, fontWeight: 900, color: "#212121", margin: 0 },
  modalPrice: { fontSize: 13, fontWeight: 700, color: "#b71c1c", marginTop: 3 },
  modalBody: { padding: "20px 22px 26px", display: "flex", flexDirection: "column", gap: 16 },
  sectionLabel: {
    fontSize: 11, fontWeight: 900, letterSpacing: "0.2em",
    textTransform: "uppercase", color: "#9e9e9e",
  },
  modalRow: { display: "flex", alignItems: "center", gap: 10 },
  sizeSelect: {
    flex: 1, border: "1.5px solid #f5deb3",
    borderRadius: 10, padding: "9px 12px",
    fontSize: 14, fontWeight: 700, color: "#424242",
    background: "#fffdf7", cursor: "pointer",
    outline: "none",
  },
  stepper: {
    display: "flex", alignItems: "center", gap: 4,
    background: "#fafafa", borderRadius: 10,
    border: "1.5px solid #f5deb3",
    padding: "2px 4px",
  },
  stepBtn: {
    width: 32, height: 32,
    border: "none", background: "transparent",
    color: "#b71c1c", fontWeight: 900, fontSize: 18,
    cursor: "pointer", borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  stepNum: { width: 28, textAlign: "center", fontWeight: 800, fontSize: 15 },
  rowAmt: { fontSize: 14, fontWeight: 800, color: "#b71c1c", minWidth: 64, textAlign: "right" },
  removeRowBtn: {
    border: "none", background: "transparent",
    color: "#bdbdbd", cursor: "pointer", fontSize: 14, fontWeight: 700,
    padding: 4,
  },
  addSizeBtn: {
    border: "none", background: "none",
    color: "#b71c1c", fontWeight: 700, fontSize: 14,
    cursor: "pointer", textDecoration: "underline",
    padding: 0, alignSelf: "flex-start",
  },
  summary: {
    background: "#fff9f0", borderRadius: 12,
    padding: "14px 16px", border: "1px solid #f5deb3",
  },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 },
  confirmBtn: {
    width: "100%", background: "#b71c1c", color: "#fff",
    border: "none", borderRadius: 50,
    padding: "14px 20px", fontSize: 16, fontWeight: 900,
    cursor: "pointer", letterSpacing: "0.02em",
    boxShadow: "0 6px 20px rgba(183,28,28,0.25)",
  },
  // Checkout form
  formLabel: {
    fontSize: 11, fontWeight: 900, letterSpacing: "0.18em",
    textTransform: "uppercase", color: "#9e9e9e", marginBottom: 8,
  },
  input: {
    width: "100%", border: "1.5px solid #f5deb3",
    borderRadius: 10, padding: "10px 13px",
    fontSize: 14, marginBottom: 8,
    boxSizing: "border-box", outline: "none",
    fontFamily: "inherit",
  },
  payBtn: {
    width: "100%", background: "#1b5e20", color: "#fff",
    border: "none", borderRadius: 50,
    padding: "13px 20px", fontSize: 15, fontWeight: 800,
    cursor: "pointer", letterSpacing: "0.02em",
    boxShadow: "0 4px 16px rgba(27,94,32,0.25)",
    marginTop: 4,
  },
  closeBtn: {
    width: 30, height: 30, border: "none",
    background: "#f5f5f5", borderRadius: "50%",
    cursor: "pointer", fontSize: 14, fontWeight: 700,
    color: "#757575", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};
