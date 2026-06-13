import { useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const TSHIRT_SIZES = Array.from(
  { length: (50 - 20) / 2 + 1 },
  (_, i) => String(20 + i * 2)
); // ["20","22","24",...,"58"]

const BACKEND_URL = "http://localhost:8080/tshirt";

const PRODUCTS = [
  {
    id: "tshirt",
    type: "tshirt",
    name: "Festival T-Shirt",
    description:
      "Premium cotton festival T-shirt. Available in sizes 20 to 50. Price is uniform across all sizes.",
    price: 1,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    badge: "Most Popular",
  },
  {
    id: "idcard",
    type: "idcard",
    name: "Volunteer ID Card",
    description:
      "Official laminated ID card for registered volunteers. Single standard size.",
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

function openRazorpay(options) {
  return new Promise((resolve, reject) => {
    console.log(Window.Razorpay)
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded. Add the script tag to your HTML."));
      return;
    }
    const rzp = new window.Razorpay({ ...options, handler: resolve });
    rzp.on("payment.failed", reject);
    rzp.open();
  });
}

async function createOrder(payload) {
  console.log(payload);
  const res = await fetch(`${BACKEND_URL}/createOrder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Shop() {
  const [activeProduct, setActiveProduct] = useState(null); // product object | null

  return (
    <div style={s.page}>
      {/* Header — logo only, no cart */}


      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <p style={s.eyebrow}>✦ Limited Edition 2026 ✦</p>
          <h1 style={s.heroTitle}>Get Your Festival Gear</h1>
          <p style={s.heroSub}>
            Official merchandise for devotees and volunteers. Quality guaranteed.
          </p>
        </div>
        <div style={s.heroDeco} />
      </section>

      {/* Products */}
      <main style={s.main}>
        <div style={s.grid}>
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => setActiveProduct(p)} />
          ))}
        </div>
      </main>

      {/* Single popup — opens when a product is chosen */}
      {activeProduct && (
        <OrderPopup
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }) {
  return (
    <article style={s.card}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={product.image} alt={product.name} style={s.cardImg} />
        <span style={s.cardBadge}>{product.badge}</span>
        <span style={s.cardPrice}>{money(product.price)}</span>
      </div>
      <div style={s.cardBody}>
        <h2 style={s.cardTitle}>{product.name}</h2>
        <p style={s.cardDesc}>{product.description}</p>
        {product.type === "tshirt" && (
          <p style={s.sizeHint}>📏 Sizes 20 – 58 (step 2) · Same price all sizes</p>
        )}
        <button onClick={onAdd} style={s.addBtn}>
          Order Now
        </button>
      </div>
    </article>
  );
}

// ── Order Popup (2-step) ──────────────────────────────────────────────────────
function OrderPopup({ product, onClose }) {
  const isTshirt = product.type === "tshirt";
  const sizes = isTshirt ? TSHIRT_SIZES : ["Standard"];

  // Step 1 state
  const [rows, setRows] = useState([{ size: sizes[0], quantity: 1 }]);

  // Step 2 state
  const [step, setStep] = useState(1); // 1 | 2
  const [customer, setCustomer] = useState({ name: "", phoneNumber: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | {ok, msg}

  const totalQty = rows.reduce((s, r) => s + r.quantity, 0);
  const totalAmt = totalQty * product.price;

  function updateRow(i, field, value) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { size: sizes[0], quantity: 1 }]);
  }
  function removeRow(i) {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  function goToStep2() {
    if (totalQty === 0) return;
    // Merge duplicate sizes
    const merged = {};
    rows.forEach(({ size, quantity }) => { merged[size] = (merged[size] || 0) + quantity; });
    setRows(Object.entries(merged).map(([size, quantity]) => ({ size, quantity })));
    setStep(2);
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phoneNumber.trim()) {
      setStatus({ ok: false, msg: "Name and phone number are required." });
      return;
    }
    try {
      setLoading(true);
      setStatus(null);

      const payload = {
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        amount: totalAmt,
        sizeQuantities: rows.map((r) => ({ size: r.size, quantity: r.quantity })),
        totalQuantity: totalQty,
      };

      const order = await createOrder(payload);

      const payment = await openRazorpay({
        key: order.razorpayKeyId || "rzp_test_Szs3bpXCvig4pQ",
        amount: order.amount * 100,
        currency: "INR",
        name: "Festival Store",
        description: `Order – ${product.name}`,
        order_id: order.razorpayOrderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phoneNumber },
        theme: { color: "#b71c1c" },
      });

      setStatus({
        ok: true,
        msg: `✅ Payment successful! ID: ${payment.razorpay_payment_id}`,
      });
    } catch (err) {
      setStatus({ ok: false, msg: `❌ ${err.message || "Payment failed. Please try again."}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.popup}>

        {/* ── Popup header ── */}
        <div style={s.popupHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={product.image} alt="" style={s.popupThumb} />
            <div>
              <p style={s.popupProductName}>{product.name}</p>
              <p style={s.popupProductPrice}>{money(product.price)} per piece</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Step indicator */}
            <div style={s.steps}>
              <span style={{ ...s.stepDot, background: "#b71c1c", color: "#fff" }}>1</span>
              <div style={s.stepLine} />
              <span style={{ ...s.stepDot, background: step === 2 ? "#b71c1c" : "#e0e0e0", color: step === 2 ? "#fff" : "#9e9e9e" }}>2</span>
            </div>
            <button onClick={onClose} style={s.closeBtn}>✕</button>
          </div>
        </div>

        {/* ── Step 1: Size & Quantity ── */}
        {step === 1 && (
          <div style={s.popupBody}>
            <p style={s.sectionLabel}>
              {isTshirt ? "Select Sizes & Quantities" : "Select Quantity"}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((row, i) => (
                <div key={i} style={s.modalRow}>
                  {/* Size selector */}
                  {isTshirt && (
                    <select
                      value={row.size}
                      onChange={(e) => updateRow(i, "size", e.target.value)}
                      style={s.sizeSelect}
                    >
                      {sizes.map((sz) => (
                        <option key={sz} value={sz}>Size {sz}</option>
                      ))}
                    </select>
                  )}

                  {/* Stepper */}
                  <div style={s.stepper}>
                    <button
                      type="button"
                      style={s.stepBtn}
                      onClick={() => updateRow(i, "quantity", Math.max(1, row.quantity - 1))}
                    >−</button>
                    <span style={s.stepNum}>{row.quantity}</span>
                    <button
                      type="button"
                      style={s.stepBtn}
                      onClick={() => updateRow(i, "quantity", row.quantity + 1)}
                    >+</button>
                  </div>

                  {/* Row subtotal */}
                  <span style={s.rowAmt}>{money(row.quantity * product.price)}</span>

                  {/* Remove row */}
                  {rows.length > 1 && (
                    <button type="button" style={s.removeRowBtn} onClick={() => removeRow(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>

            {isTshirt && (
              <button type="button" onClick={addRow} style={s.addSizeBtn}>
                + Add another size
              </button>
            )}

            {/* Summary bar */}
            <div style={s.summaryBar}>
              <div>
                <span style={{ fontSize: 12, color: "#9e9e9e", fontWeight: 700 }}>TOTAL</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#b71c1c" }}>{money(totalAmt)}</div>
                <span style={{ fontSize: 12, color: "#757575" }}>{totalQty} {totalQty === 1 ? "piece" : "pieces"}</span>
              </div>
              <button
                type="button"
                disabled={totalQty === 0}
                onClick={goToStep2}
                style={{ ...s.primaryBtn, opacity: totalQty === 0 ? 0.5 : 1 }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Customer details & Pay ── */}
        {step === 2 && (
          <div style={s.popupBody}>
            {/* Order summary (read-only) */}
            <div style={s.orderSummary}>
              <p style={s.sectionLabel}>Your Order</p>
              {rows.map((r) => (
                <div key={r.size} style={s.summaryLine}>
                  <span style={{ fontWeight: 700, color: "#424242" }}>
                    {r.size === "Standard" ? "Standard" : `Size ${r.size}`} × {r.quantity}
                  </span>
                  <span style={{ fontWeight: 800, color: "#b71c1c" }}>
                    {money(r.quantity * product.price)}
                  </span>
                </div>
              ))}
              <div style={{ ...s.summaryLine, borderTop: "1px solid #f5deb3", paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 900, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 16, color: "#b71c1c" }}>{money(totalAmt)}</span>
              </div>
            </div>

            {/* Details form */}
            <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={s.sectionLabel}>Your Details</p>

              <input
                type="text"
                placeholder="Full Name *"
                value={customer.name}
                required
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                style={s.input}
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                value={customer.phoneNumber}
                required
                onChange={(e) => setCustomer({ ...customer, phoneNumber: e.target.value })}
                style={s.input}
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                style={s.input}
              />

              {status && (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: status.ok ? "#f0fdf4" : "#fef2f2",
                  color: status.ok ? "#166534" : "#991b1b",
                  border: `1px solid ${status.ok ? "#bbf7d0" : "#fecaca"}`,
                }}>
                  {status.msg}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setStatus(null); }}
                  style={s.backBtn}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || status?.ok}
                  style={{ ...s.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Processing…" : `Pay ${money(totalAmt)}`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#fff8f0 0%,#fff3e0 50%,#fce4ec 100%)",
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    color: "#212121",
  },
  // Header
  header: {
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #f5deb3",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 2px 20px rgba(198,40,40,0.07)",
  },
  headerInner: {
    maxWidth: 1100, margin: "0 auto",
    padding: "14px 24px",
    display: "flex", alignItems: "center",
  },
  logo: { display: "flex", alignItems: "center", gap: 12 },
  logoTitle: { fontSize: 18, fontWeight: 900, color: "#b71c1c", letterSpacing: "-0.5px" },
  logoSub: { fontSize: 11, fontWeight: 600, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.08em" },
  // Hero
  hero: {
    position: "relative",
    background: "linear-gradient(135deg,#b71c1c 0%,#880e0e 60%,#4a0000 100%)",
    color: "#fff", padding: "64px 24px", overflow: "hidden", textAlign: "center",
  },
  heroDeco: {
    position: "absolute", top: -60, right: -60,
    width: 300, height: 300, borderRadius: "50%",
    background: "rgba(255,200,0,0.10)", pointerEvents: "none",
  },
  heroContent: { position: "relative", maxWidth: 640, margin: "0 auto" },
  eyebrow: { fontSize: 12, fontWeight: 800, letterSpacing: "0.25em", color: "#ffcc80", textTransform: "uppercase", marginBottom: 12 },
  heroTitle: { fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-1px" },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.82)", lineHeight: 1.7 },
  // Products
  main: { maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28 },
  card: {
    background: "#fff", borderRadius: 20, overflow: "hidden",
    boxShadow: "0 8px 40px rgba(183,28,28,0.08)",
    border: "1px solid rgba(245,222,179,0.6)",
  },
  cardImg: { width: "100%", height: 240, objectFit: "cover", display: "block" },
  cardBadge: {
    position: "absolute", top: 14, left: 14,
    background: "#b71c1c", color: "#fff",
    fontSize: 11, fontWeight: 800, padding: "4px 12px",
    borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.06em",
  },
  cardPrice: {
    position: "absolute", top: 14, right: 14,
    background: "rgba(255,255,255,0.96)", color: "#b71c1c",
    fontWeight: 900, fontSize: 18, padding: "4px 14px",
    borderRadius: 50, boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
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
    border: "none", borderRadius: 50, padding: "13px 20px",
    fontSize: 15, fontWeight: 800, cursor: "pointer",
    boxShadow: "0 6px 20px rgba(183,28,28,0.25)",
    letterSpacing: "0.02em",
  },
  // Popup
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(5px)", zIndex: 300,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  },
  popup: {
    background: "#fff", borderRadius: 22,
    width: "100%", maxWidth: 480,
    boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
    maxHeight: "92vh", overflowY: "auto",
    display: "flex", flexDirection: "column",
  },
  popupHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: "1px solid #f0e6d3",
    background: "#fff9f0", flexShrink: 0,
  },
  popupThumb: { width: 48, height: 48, borderRadius: 10, objectFit: "cover" },
  popupProductName: { fontWeight: 900, fontSize: 15, margin: 0 },
  popupProductPrice: { fontSize: 13, fontWeight: 700, color: "#b71c1c", margin: "2px 0 0" },
  // Step indicator
  steps: { display: "flex", alignItems: "center", gap: 4 },
  stepDot: {
    width: 24, height: 24, borderRadius: "50%",
    fontSize: 12, fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  stepLine: { width: 20, height: 2, background: "#e0e0e0", borderRadius: 2 },
  closeBtn: {
    width: 30, height: 30, border: "none", background: "#f5f5f5",
    borderRadius: "50%", cursor: "pointer", fontSize: 13,
    fontWeight: 700, color: "#757575",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  popupBody: { padding: "20px 22px 26px", display: "flex", flexDirection: "column", gap: 16 },
  sectionLabel: {
    fontSize: 10, fontWeight: 900, letterSpacing: "0.22em",
    textTransform: "uppercase", color: "#9e9e9e",
  },
  // Row (size + stepper)
  modalRow: { display: "flex", alignItems: "center", gap: 10 },
  sizeSelect: {
    flex: 1, border: "1.5px solid #f5deb3", borderRadius: 10,
    padding: "9px 12px", fontSize: 14, fontWeight: 700,
    color: "#424242", background: "#fffdf7", cursor: "pointer", outline: "none",
  },
  stepper: {
    display: "flex", alignItems: "center", gap: 2,
    background: "#fafafa", borderRadius: 10,
    border: "1.5px solid #f5deb3", padding: "2px 4px",
  },
  stepBtn: {
    width: 32, height: 32, border: "none", background: "transparent",
    color: "#b71c1c", fontWeight: 900, fontSize: 18, cursor: "pointer",
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
  },
  stepNum: { width: 28, textAlign: "center", fontWeight: 800, fontSize: 15 },
  rowAmt: { fontSize: 14, fontWeight: 800, color: "#b71c1c", minWidth: 64, textAlign: "right" },
  removeRowBtn: {
    border: "none", background: "transparent", color: "#bdbdbd",
    cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 4,
  },
  addSizeBtn: {
    border: "none", background: "none", color: "#b71c1c",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    textDecoration: "underline", padding: 0, alignSelf: "flex-start",
  },
  // Summary bar (bottom of step 1)
  summaryBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "#fff9f0", borderRadius: 14, padding: "14px 18px",
    border: "1px solid #f5deb3", marginTop: 4,
  },
  // Step 2 order summary
  orderSummary: {
    background: "#fff9f0", borderRadius: 12,
    padding: "14px 16px", border: "1px solid #f5deb3",
    display: "flex", flexDirection: "column", gap: 6,
  },
  summaryLine: { display: "flex", justifyContent: "space-between", fontSize: 14 },
  // Inputs
  input: {
    width: "100%", border: "1.5px solid #f5deb3", borderRadius: 10,
    padding: "11px 14px", fontSize: 14, boxSizing: "border-box",
    outline: "none", fontFamily: "inherit", color: "#212121",
  },
  // Buttons
  primaryBtn: {
    background: "#b71c1c", color: "#fff", border: "none",
    borderRadius: 50, padding: "13px 22px", fontSize: 15,
    fontWeight: 800, cursor: "pointer", letterSpacing: "0.02em",
    boxShadow: "0 6px 20px rgba(183,28,28,0.25)",
  },
  backBtn: {
    background: "#f5f5f5", color: "#424242", border: "none",
    borderRadius: 50, padding: "13px 18px", fontSize: 14,
    fontWeight: 700, cursor: "pointer",
  },
};
