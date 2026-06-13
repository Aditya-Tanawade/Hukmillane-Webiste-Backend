import { useState, useRef } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const TSHIRT_SIZES = Array.from(
  { length: (50 - 20) / 2 + 1 },
  (_, i) => String(20 + i * 2)
);

const BACKEND_URL = "http://localhost:8080/tshirt";

const PRODUCTS = [
  {
    id: "tshirt",
    type: "tshirt",
    name: "Mandal T-Shirt",
    description:
      "Premium cotton festival T-shirt. Price is uniform across all sizes.",
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
      "Official laminated ID card for registered volunteers. \nSingle standard size.",
    price: 1,
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

function validateName(name) {
  const trimmed = name.trim();
  if (!trimmed) return "Full name is required.";
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (!/^[a-zA-Z\s'.'-]+$/.test(trimmed)) return "Name can only contain letters and spaces.";
  return null;
}

function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return "Phone number is required.";
  if (cleaned.length !== 10) return "Enter a valid 10-digit phone number.";
  if (!/^[6-9]/.test(cleaned)) return "Phone must start with 6, 7, 8, or 9.";
  return null;
}

// Email is now REQUIRED
function validateEmail(email) {
  if (!email.trim()) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
  return null;
}

function buildSizeNote(rows) {
  return rows
    .map((r) => (r.size === "Standard" ? `Standard x${r.quantity}` : `Size ${r.size} x${r.quantity}`))
    .join(", ");
}

function openRazorpay(options) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK not loaded. Add the script tag to your HTML."));
      return;
    }
    const rzp = new window.Razorpay({ ...options, handler: resolve });
    rzp.on("payment.failed", (resp) => reject(resp.error));
    rzp.open();
  });
}

async function createOrder(payload) {
  const res = await fetch(`${BACKEND_URL}/createOrder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function paymentCallback(params) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BACKEND_URL}/paymentCallback?${query}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Processing Overlay ────────────────────────────────────────────────────────
function ProcessingOverlay({ message }) {
  return (
    <div style={s.processingOverlay}>
      <div style={s.processingCard}>
        <div style={s.spinnerWrap}>
          <svg style={s.spinner} viewBox="0 0 50 50">
            <circle
              cx="25" cy="25" r="20"
              fill="none"
              stroke="#b71c1c"
              strokeWidth="4"
              strokeDasharray="100 28"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p style={s.processingTitle}>Processing…</p>
        <p style={s.processingMsg}>{message}</p>
        <p style={s.processingHint}>Please don't close this window</p>
      </div>
    </div>
  );
}

// ── Reusable validated field ──────────────────────────────────────────────────
function ValidatedInput({ type = "text", placeholder, value, onChange, error, valid, hint, prefix, maxLength, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ position: "relative" }}>
        {prefix && <span style={s.fieldPrefix}>{prefix}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={onChange}
          maxLength={maxLength}
          style={{
            ...s.input,
            paddingLeft: prefix ? 44 : 14,
            paddingRight: valid ? 36 : 14,
            borderColor: error ? "#ef4444" : valid ? "#22c55e" : "#f5deb3",
          }}
        />
        {valid && !error && <span style={s.fieldCheck}>✓</span>}
      </div>
      {error && <span style={s.fieldError}>{error}</span>}
      {!error && hint && <span style={s.fieldHint}>{hint}</span>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Shop() {
  const [activeProduct, setActiveProduct] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [failureData, setFailureData] = useState(null);

  return (
    <div style={s.page}>
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

      <main style={s.main}>
        <div style={s.grid}>
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={() => setActiveProduct(p)} />
          ))}
        </div>
      </main>

      {activeProduct && (
        <OrderPopup
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onSuccess={(data) => { setActiveProduct(null); setReceiptData(data); }}
          onFailure={(err) => { setActiveProduct(null); setFailureData(err); }}
        />
      )}

      {receiptData && <ReceiptPopup data={receiptData} onClose={() => setReceiptData(null)} />}
      {failureData && <FailurePopup error={failureData} onClose={() => setFailureData(null)} onRetry={() => setFailureData(null)} />}
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
        <button onClick={onAdd} style={s.addBtn}>Buy Now</button>
      </div>
    </article>
  );
}

// ── Order Popup ───────────────────────────────────────────────────────────────
function OrderPopup({ product, onClose, onSuccess, onFailure }) {
  const isTshirt = product.type === "tshirt";
  const sizes = isTshirt ? TSHIRT_SIZES : ["Standard"];

  const [rows, setRows] = useState([{ size: sizes[0], quantity: 1 }]);
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({ name: "", phoneNumber: "", email: "" });
  const [touched, setTouched] = useState({ name: false, phoneNumber: false, email: false });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("Verifying your payment…");
  const [inlineError, setInlineError] = useState(null);

  const totalQty = rows.reduce((acc, r) => acc + r.quantity, 0);
  const totalAmt = totalQty * product.price;

  const nameError  = validateName(customer.name);
  const phoneError = validatePhone(customer.phoneNumber);
  const emailError = validateEmail(customer.email);

  const nameValid  = !nameError  && customer.name.trim().length > 0;
  const phoneValid = !phoneError && customer.phoneNumber.length === 10;
  const emailValid = !emailError && customer.email.trim().length > 0;

  const phoneHint = !phoneError && customer.phoneNumber.length > 0 && customer.phoneNumber.length < 10
    ? `${10 - customer.phoneNumber.length} more digits needed`
    : null;

  function touch(field) { setTouched((t) => ({ ...t, [field]: true })); }

  function updateRow(i, field, value) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }
  function addRow() { setRows((prev) => [...prev, { size: sizes[0], quantity: 1 }]); }
  function removeRow(i) { setRows((prev) => prev.filter((_, idx) => idx !== i)); }

  function goToStep2() {
    if (totalQty === 0) return;
    const merged = {};
    rows.forEach(({ size, quantity }) => { merged[size] = (merged[size] || 0) + quantity; });
    setRows(Object.entries(merged).map(([size, quantity]) => ({ size, quantity })));
    setStep(2);
  }

  function handlePhoneChange(val) {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setCustomer((c) => ({ ...c, phoneNumber: digits }));
  }

  async function handlePay(e) {
    e.preventDefault();
    setTouched({ name: true, phoneNumber: true, email: true });
    if (nameError || phoneError || emailError) return;

    try {
      setLoading(true);
      setInlineError(null);

      const payload = {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phoneNumber: customer.phoneNumber,
        amount: totalAmt,
        sizeQuantities: rows.map((r) => ({ size: r.size, quantity: r.quantity })),
        totalQuantity: totalQty,
      };

      // 1. Create order
      const order = await createOrder(payload);

      // 2. Open Razorpay
      let payment;
      try {
        payment = await openRazorpay({
          key: order.razorpayKeyId || "rzp_test_Szs3bpXCvig4pQ",
          amount: order.amount * 100,
          currency: "INR",
          name: "HukmillLane Cha Raja",
          description: `Order – ${product.name}`,
          order_id: order.razorpayOrderId,
          prefill: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            contact: customer.phoneNumber,
          },
          notes: {
            product: product.name,
            sizes_and_quantities: buildSizeNote(rows),
            total_pieces: String(totalQty),
            customer_phone: customer.phoneNumber,
          },
          theme: { color: "#b71c1c" },
        });
      } catch (rzpErr) {
        if (rzpErr?.metadata) {
          paymentCallback({
            razorpay_order_id: rzpErr.metadata.order_id || order.razorpayOrderId,
            razorpay_payment_id: rzpErr.metadata.payment_id || "",
            razorpay_signature: "",
          }).catch(() => {});
        }
        onFailure({
          code: rzpErr?.code || "PAYMENT_FAILED",
          description: rzpErr?.description || "Payment was not completed. Please try again.",
          orderId: order.razorpayOrderId,
        });
        return;
      }

      // 3. Verify — show processing overlay, handle slow/timeout
      setLoading(false);
      setVerifying(true);
      setVerifyMsg("Verifying your payment…");

      const slowTimer = setTimeout(() => {
        setVerifyMsg("Still confirming with our server… almost there.");
      }, 5000);

      let verified;
      try {
        verified = await Promise.race([
          paymentCallback({
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT")), 30000)
          ),
        ]);
      } catch (verifyErr) {
        clearTimeout(slowTimer);
        setVerifying(false);
        onFailure(
          verifyErr.message === "TIMEOUT"
            ? {
                code: "VERIFY_TIMEOUT",
                description: "Your payment was received but confirmation is taking too long. Please contact support with your payment ID.",
                orderId: order.razorpayOrderId,
                paymentId: payment.razorpay_payment_id,
              }
            : {
                code: "VERIFY_FAILED",
                description: verifyErr.message || "Payment verification failed. Contact support.",
                orderId: order.razorpayOrderId,
                paymentId: payment.razorpay_payment_id,
              }
        );
        return;
      }

      clearTimeout(slowTimer);
      setVerifying(false);

      if (verified?.orderStatus === "PAYMENT_SUCESS") {
        onSuccess({ ...verified, customerName: customer.name.trim(), productName: product.name });
      } else {
        onFailure({
          description: "Payment verification failed. Contact support.",
          orderId: order.razorpayOrderId,
          paymentId: payment.razorpay_payment_id,
        });
      }
    } catch (err) {
      setVerifying(false);
      setInlineError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verifying) return <ProcessingOverlay message={verifyMsg} />;

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.popup}>
        {/* Header */}
        <div style={s.popupHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={product.image} alt="" style={s.popupThumb} />
            <div>
              <p style={s.popupProductName}>{product.name}</p>
              <p style={s.popupProductPrice}>{money(product.price)} per piece</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={s.steps}>
              <span style={{ ...s.stepDot, background: "#b71c1c", color: "#fff" }}>1</span>
              <div style={s.stepLine} />
              <span style={{ ...s.stepDot, background: step === 2 ? "#b71c1c" : "#e0e0e0", color: step === 2 ? "#fff" : "#9e9e9e" }}>2</span>
            </div>
            <button onClick={onClose} style={s.closeBtn}>✕</button>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={s.popupBody}>
            <p style={s.sectionLabel}>{isTshirt ? "Select Sizes & Quantities" : "Select Quantity"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((row, i) => (
                <div key={i} style={s.modalRow}>
                  {isTshirt && (
                    <select value={row.size} onChange={(e) => updateRow(i, "size", e.target.value)} style={s.sizeSelect}>
                      {sizes.map((sz) => <option key={sz} value={sz}>Size {sz}</option>)}
                    </select>
                  )}
                  <div style={s.stepper}>
                    <button type="button" style={s.stepBtn} onClick={() => updateRow(i, "quantity", Math.max(1, row.quantity - 1))}>−</button>
                    <span style={s.stepNum}>{row.quantity}</span>
                    <button type="button" style={s.stepBtn} onClick={() => updateRow(i, "quantity", row.quantity + 1)}>+</button>
                  </div>
                  <span style={s.rowAmt}>{money(row.quantity * product.price)}</span>
                  {rows.length > 1 && <button type="button" style={s.removeRowBtn} onClick={() => removeRow(i)}>✕</button>}
                </div>
              ))}
            </div>
            {isTshirt && <button type="button" onClick={addRow} style={s.addSizeBtn}>+ Add another size</button>}
            <div style={s.summaryBar}>
              <div>
                <span style={{ fontSize: 12, color: "#9e9e9e", fontWeight: 700 }}>TOTAL</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#b71c1c" }}>{money(totalAmt)}</div>
                <span style={{ fontSize: 12, color: "#757575" }}>{totalQty} {totalQty === 1 ? "piece" : "pieces"}</span>
              </div>
              <button type="button" disabled={totalQty === 0} onClick={goToStep2} style={{ ...s.primaryBtn, opacity: totalQty === 0 ? 0.5 : 1 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={s.popupBody}>
            <div style={s.orderSummary}>
              <p style={s.sectionLabel}>Your Order</p>
              {rows.map((r) => (
                <div key={r.size} style={s.summaryLine}>
                  <span style={{ fontWeight: 700, color: "#424242" }}>{r.size === "Standard" ? "Standard" : `Size ${r.size}`} × {r.quantity}</span>
                  <span style={{ fontWeight: 800, color: "#b71c1c" }}>{money(r.quantity * product.price)}</span>
                </div>
              ))}
              <div style={{ ...s.summaryLine, borderTop: "1px solid #f5deb3", paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontWeight: 900, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 16, color: "#b71c1c" }}>{money(totalAmt)}</span>
              </div>
            </div>

            <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={s.sectionLabel}>Your Details</p>

              <ValidatedInput
                type="text" placeholder="Full Name *" value={customer.name} required
                onChange={(e) => { setCustomer({ ...customer, name: e.target.value }); touch("name"); }}
                error={touched.name ? nameError : null} valid={nameValid}
              />
              <ValidatedInput
                type="tel" placeholder="10-digit phone number *" value={customer.phoneNumber}
                required prefix="+91" maxLength={10}
                onChange={(e) => { handlePhoneChange(e.target.value); touch("phoneNumber"); }}
                error={touched.phoneNumber ? phoneError : null} valid={phoneValid} hint={phoneHint}
              />
              <ValidatedInput
                type="email" placeholder="Email Address *" value={customer.email} required
                onChange={(e) => { setCustomer({ ...customer, email: e.target.value }); touch("email"); }}
                error={touched.email ? emailError : null} valid={emailValid}
              />

              {inlineError && <div style={s.inlineError}>{inlineError}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { setStep(1); setInlineError(null); }} style={s.backBtn}>← Back</button>
                <button type="submit" disabled={loading} style={{ ...s.primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}>
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

// ── Receipt / Success Popup ───────────────────────────────────────────────────
function ReceiptPopup({ data, onClose }) {
  const receiptRef = useRef(null);

  const orderedAt = data.updatedAt
    ? new Date(data.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const pricePerPiece = data.totalQuantity > 0 ? data.amount / data.totalQuantity : 0;

  function handleDownload() {
    const sizeRows = data.sizeQuantities?.length > 0
      ? `<div class="sizes">${data.sizeQuantities.map(sq => `<p>${sq.size === "Standard" ? "Standard" : `Size ${sq.size}`} × ${sq.quantity}</p>`).join("")}</div>`
      : "";

    const receiptHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Receipt – ${data.razorpayOrderId || "Order"}</title>
<style>
  body{font-family:'Segoe UI',sans-serif;max-width:480px;margin:40px auto;color:#212121}
  .header{text-align:center;border-bottom:2px solid #b71c1c;padding-bottom:16px;margin-bottom:24px}
  .header h1{color:#b71c1c;font-size:22px;margin:0 0 4px}.header p{color:#757575;font-size:13px;margin:0}
  .badge{display:inline-block;background:#dcfce7;color:#166534;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:16px}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f5f5;font-size:14px}
  .row .label{color:#9e9e9e;font-weight:600}.row .value{font-weight:700;color:#212121}
  .total-row{display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:900;color:#b71c1c;border-top:2px solid #b71c1c;margin-top:8px}
  .sizes{background:#fff9f0;border-radius:8px;padding:12px 14px;margin:12px 0}.sizes p{margin:4px 0;font-size:13px;font-weight:600}
  .footer{text-align:center;margin-top:32px;font-size:12px;color:#bdbdbd}
</style></head><body>
  <div class="header"><h1>🎉 HukmillLane Cha Raja</h1><p>Official Payment Receipt</p></div>
  <div style="text-align:center"><span class="badge">✅ Payment Successful</span></div>
  <div class="row"><span class="label">Booking ID</span><span class="value">${data.bookingId || "—"}</span></div>
  <div class="row"><span class="label">Customer</span><span class="value">${data.customerName || data.name || "—"}</span></div>
  <div class="row"><span class="label">Phone</span><span class="value">${data.phoneNumber || "—"}</span></div>
  ${data.email ? `<div class="row"><span class="label">Email</span><span class="value">${data.email}</span></div>` : ""}
  <div class="row"><span class="label">Order ID</span><span class="value" style="font-family:monospace;font-size:12px">${data.razorpayOrderId || "—"}</span></div>
  <div class="row"><span class="label">Payment ID</span><span class="value" style="font-family:monospace;font-size:12px">${data.razorpayPaymentId || "—"}</span></div>
  <div class="row"><span class="label">Status</span><span class="value" style="color:#166534">CONFIRMED</span></div>
  <div class="row"><span class="label">Total Quantity</span><span class="value">${data.totalQuantity}</span></div>
  <div class="row"><span class="label">Date & Time</span><span class="value">${orderedAt}</span></div>
  <div class="row"><span class="label">Product</span><span class="value">${data.productName || "Festival Item"}</span></div>
  ${sizeRows}
  <div class="total-row"><span>Total Paid</span><span>₹${data.amount || "—"}</span></div>
  <div class="footer">Thank you for your order! Keep this receipt for your records.</div>
</body></html>`;

    const win = window.open("", "_blank");
    win.document.write(receiptHtml);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  return (
    <div style={s.overlay}>
      <div style={{ ...s.popup, maxWidth: 460 }}>
        <div style={s.successHeader}>
          <div style={s.successIcon}>🎉</div>
          <h2 style={s.successTitle}>Payment Successful!</h2>
          <p style={s.successSub}>Your order is confirmed. Here's your receipt.</p>
        </div>

        <div style={s.receiptBody} ref={receiptRef}>
          <div style={s.receiptDivider}>
            <div style={s.dashedLine} />
            <span style={s.receiptLabel}>RECEIPT</span>
            <div style={s.dashedLine} />
          </div>

          <ReceiptRow label="Booking ID" value={data.bookingId || "—"} />
          <ReceiptRow label="Customer" value={data.customerName || data.name || "—"} />
          <ReceiptRow label="Phone" value={data.phoneNumber || "—"} />
          {data.email && <ReceiptRow label="Email" value={data.email} />}
          <ReceiptRow label="Product" value={data.productName || "Festival Item"} />

          {data.sizeQuantities?.length > 0 && (
            <div style={s.sizesBox}>
              {data.sizeQuantities.map((sq) => (
                <div key={sq.size} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#616161", fontWeight: 600 }}>
                    {sq.size === "Standard" ? "Standard" : `Size ${sq.size}`} × {sq.quantity}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#424242" }}>
                    {money(sq.quantity * pricePerPiece)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total Quantity — now visible in receipt UI */}
          <ReceiptRow label="Total Quantity" value={`${data.totalQuantity} ${data.totalQuantity === 1 ? "piece" : "pieces"}`} />
          <ReceiptRow label="Order ID" value={data.razorpayOrderId} mono />
          <ReceiptRow label="Payment ID" value={data.razorpayPaymentId} mono />
          <ReceiptRow label="Date" value={orderedAt} />
          <ReceiptRow label="Status" value="✅ CONFIRMED" highlight />

          <div style={{ ...s.receiptDivider, margin: "12px 0 0" }}>
            <div style={s.dashedLine} />
          </div>

          <div style={s.receiptTotal}>
            <span>Total Paid</span>
            <span style={{ color: "#b71c1c" }}>{money(data.amount)}</span>
          </div>
        </div>

        <div style={{ padding: "0 22px 24px", display: "flex", gap: 10 }}>
          <button onClick={handleDownload} style={s.downloadBtn}>⬇ Download Receipt</button>
          <button onClick={onClose} style={{ ...s.primaryBtn, flex: 1 }}>Done</button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, mono, highlight }) {
  return (
    <div style={s.receiptRow}>
      <span style={s.receiptRowLabel}>{label}</span>
      <span style={{
        ...s.receiptRowValue,
        fontFamily: mono ? "monospace" : "inherit",
        fontSize: mono ? 12 : 14,
        color: highlight ? "#166534" : "#212121",
        background: highlight ? "#dcfce7" : "transparent",
        padding: highlight ? "2px 8px" : 0,
        borderRadius: highlight ? 20 : 0,
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ── Failure Popup ─────────────────────────────────────────────────────────────
const FAILURE_TIPS = [
  "Ensure you have sufficient balance.",
  "Try a different payment method.",
  "Contact your bank if the issue persists.",
];

function FailurePopup({ error, onClose, onRetry }) {
  return (
    <div style={s.overlay}>
      <div style={{ ...s.popup, maxWidth: 420 }}>
        <div style={s.failureHeader}>
          <div style={s.failureIcon}>✕</div>
          <h2 style={s.failureTitle}>Payment Failed</h2>
          <p style={s.failureSub}>{error?.description || "Your payment could not be processed."}</p>
        </div>
        <div style={s.failureBody}>
          {error?.orderId && (
            <div style={s.failureDetail}>
              <span style={s.failureDetailLabel}>Order Reference</span>
              <span style={{ ...s.failureDetailValue, fontFamily: "monospace", fontSize: 12 }}>{error.orderId}</span>
            </div>
          )}
          {error?.paymentId && (
            <div style={s.failureDetail}>
              <span style={s.failureDetailLabel}>Payment ID</span>
              <span style={{ ...s.failureDetailValue, fontFamily: "monospace", fontSize: 12 }}>{error.paymentId}</span>
            </div>
          )}
          <div style={s.failureTips}>
            <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: "#7c2d12" }}>What you can do:</p>
            {FAILURE_TIPS.map((tip) => (
              <p key={tip} style={{ fontSize: 13, color: "#9a3412", margin: "4px 0", paddingLeft: 14, position: "relative" }}>
                <span style={{ position: "absolute", left: 0 }}>•</span>{tip}
              </p>
            ))}
          </div>
        </div>
        <div style={{ padding: "0 22px 24px", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={s.backBtn}>Close</button>
          <button onClick={onRetry} style={{ ...s.primaryBtn, flex: 1 }}>Try Again</button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg,#fff8f0 0%,#fff3e0 50%,#fce4ec 100%)", fontFamily: "'Segoe UI',system-ui,sans-serif", color: "#212121" },
  hero: { position: "relative", background: "linear-gradient(135deg,#b71c1c 0%,#880e0e 60%,#4a0000 100%)", color: "#fff", padding: "64px 24px", overflow: "hidden", textAlign: "center" },
  heroDeco: { position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,200,0,0.10)", pointerEvents: "none" },
  heroContent: { position: "relative", maxWidth: 640, margin: "0 auto" },
  eyebrow: { fontSize: 12, fontWeight: 800, letterSpacing: "0.25em", color: "#ffcc80", textTransform: "uppercase", marginBottom: 12 },
  heroTitle: { fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-1px" },
  heroSub: { fontSize: 16, color: "rgba(255,255,255,0.82)", lineHeight: 1.7 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28 },
  card: { background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(183,28,28,0.08)", border: "1px solid rgba(245,222,179,0.6)" },
  cardImg: { width: "100%", height: 240, objectFit: "cover", display: "block" },
  cardBadge: { position: "absolute", top: 14, left: 14, background: "#b71c1c", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 50, textTransform: "uppercase", letterSpacing: "0.06em" },
  cardPrice: { position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.96)", color: "#b71c1c", fontWeight: 900, fontSize: 18, padding: "4px 14px", borderRadius: 50, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  cardBody: { padding: "22px 22px 26px" },
  cardTitle: { fontSize: 24, fontWeight: 900, color: "#212121", margin: "0 0 8px" },
  cardDesc: { fontSize: 14, color: "#616161", lineHeight: 1.7, margin: "0 0 10px" },
  sizeHint: { fontSize: 12, fontWeight: 700, color: "#795548", background: "#fff8e1", borderRadius: 8, padding: "6px 10px", display: "inline-block", marginBottom: 16 },
  addBtn: { width: "100%", background: "#b71c1c", color: "#fff", border: "none", borderRadius: 50, padding: "13px 20px", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(183,28,28,0.25)" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  popup: { background: "#fff", borderRadius: 22, width: "100%", maxWidth: 480, boxShadow: "0 30px 80px rgba(0,0,0,0.22)", maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column" },
  popupHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0e6d3", background: "#fff9f0", flexShrink: 0 },
  popupThumb: { width: 48, height: 48, borderRadius: 10, objectFit: "cover" },
  popupProductName: { fontWeight: 900, fontSize: 15, margin: 0 },
  popupProductPrice: { fontSize: 13, fontWeight: 700, color: "#b71c1c", margin: "2px 0 0" },
  steps: { display: "flex", alignItems: "center", gap: 4 },
  stepDot: { width: 24, height: 24, borderRadius: "50%", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  stepLine: { width: 20, height: 2, background: "#e0e0e0", borderRadius: 2 },
  closeBtn: { width: 30, height: 30, border: "none", background: "#f5f5f5", borderRadius: "50%", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#757575", display: "flex", alignItems: "center", justifyContent: "center" },
  popupBody: { padding: "20px 22px 26px", display: "flex", flexDirection: "column", gap: 16 },
  sectionLabel: { fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9e9e9e" },
  modalRow: { display: "flex", alignItems: "center", gap: 10 },
  sizeSelect: { flex: 1, border: "1.5px solid #f5deb3", borderRadius: 10, padding: "9px 12px", fontSize: 14, fontWeight: 700, color: "#424242", background: "#fffdf7", cursor: "pointer", outline: "none" },
  stepper: { display: "flex", alignItems: "center", gap: 2, background: "#fafafa", borderRadius: 10, border: "1.5px solid #f5deb3", padding: "2px 4px" },
  stepBtn: { width: 32, height: 32, border: "none", background: "transparent", color: "#b71c1c", fontWeight: 900, fontSize: 18, cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  stepNum: { width: 28, textAlign: "center", fontWeight: 800, fontSize: 15 },
  rowAmt: { fontSize: 14, fontWeight: 800, color: "#b71c1c", minWidth: 64, textAlign: "right" },
  removeRowBtn: { border: "none", background: "transparent", color: "#bdbdbd", cursor: "pointer", fontSize: 14, fontWeight: 700, padding: 4 },
  addSizeBtn: { border: "none", background: "none", color: "#b71c1c", fontWeight: 700, fontSize: 14, cursor: "pointer", textDecoration: "underline", padding: 0, alignSelf: "flex-start" },
  summaryBar: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff9f0", borderRadius: 14, padding: "14px 18px", border: "1px solid #f5deb3", marginTop: 4 },
  orderSummary: { background: "#fff9f0", borderRadius: 12, padding: "14px 16px", border: "1px solid #f5deb3", display: "flex", flexDirection: "column", gap: 6 },
  summaryLine: { display: "flex", justifyContent: "space-between", fontSize: 14 },
  fieldPrefix: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontWeight: 800, fontSize: 14, color: "#616161", pointerEvents: "none" },
  fieldCheck: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#22c55e", fontWeight: 900, fontSize: 16 },
  fieldError: { fontSize: 12, color: "#ef4444", fontWeight: 600 },
  fieldHint: { fontSize: 12, color: "#9e9e9e", fontWeight: 600 },
  inlineError: { padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  input: { width: "100%", border: "1.5px solid #f5deb3", borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: "#212121" },
  primaryBtn: { background: "#b71c1c", color: "#fff", border: "none", borderRadius: 50, padding: "13px 22px", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 20px rgba(183,28,28,0.25)" },
  backBtn: { background: "#f5f5f5", color: "#424242", border: "none", borderRadius: 50, padding: "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  // Processing overlay
  processingOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" },
  processingCard: { background: "#fff", borderRadius: 20, padding: "40px 36px", textAlign: "center", maxWidth: 320, width: "90%", boxShadow: "0 30px 80px rgba(0,0,0,0.3)" },
  spinnerWrap: { display: "flex", justifyContent: "center", marginBottom: 20 },
  spinner: { width: 52, height: 52, animation: "spin 0.9s linear infinite" },
  processingTitle: { margin: "0 0 8px", fontWeight: 900, fontSize: 18, color: "#212121" },
  processingMsg: { margin: "0 0 10px", fontSize: 14, color: "#616161", lineHeight: 1.6 },
  processingHint: { margin: 0, fontSize: 12, fontWeight: 700, color: "#b71c1c", textTransform: "uppercase", letterSpacing: "0.05em" },
  // Success
  successHeader: { background: "linear-gradient(135deg,#052e16,#14532d)", padding: "32px 24px 28px", textAlign: "center", borderRadius: "22px 22px 0 0" },
  successIcon: { width: 64, height: 64, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" },
  successTitle: { margin: "0 0 8px", color: "#fff", fontSize: 22, fontWeight: 900 },
  successSub: { margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 14 },
  receiptBody: { padding: "20px 22px", display: "flex", flexDirection: "column", gap: 0 },
  receiptDivider: { display: "flex", alignItems: "center", gap: 10, margin: "8px 0 16px" },
  dashedLine: { flex: 1, height: 1, borderTop: "2px dashed #e0e0e0" },
  receiptLabel: { fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", color: "#bdbdbd", whiteSpace: "nowrap" },
  receiptRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #fafafa" },
  receiptRowLabel: { fontSize: 12, fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.05em" },
  receiptRowValue: { fontSize: 14, fontWeight: 700 },
  sizesBox: { background: "#fff9f0", border: "1px solid #f5deb3", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" },
  receiptTotal: { display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 900, padding: "14px 0 4px" },
  downloadBtn: { background: "#f0fdf4", color: "#166534", border: "1.5px solid #bbf7d0", borderRadius: 50, padding: "13px 18px", fontSize: 14, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" },
  // Failure
  failureHeader: { background: "linear-gradient(135deg,#450a0a,#7f1d1d)", padding: "32px 24px 28px", textAlign: "center", borderRadius: "22px 22px 0 0" },
  failureIcon: { width: 64, height: 64, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 auto 16px" },
  failureTitle: { margin: "0 0 8px", color: "#fff", fontSize: 22, fontWeight: 900 },
  failureSub: { margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 14 },
  failureBody: { padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 },
  failureDetail: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca" },
  failureDetailLabel: { fontSize: 12, fontWeight: 700, color: "#9e9e9e", textTransform: "uppercase" },
  failureDetailValue: { fontSize: 14, fontWeight: 700, color: "#991b1b" },
  failureTips: { background: "#fff7ed", borderRadius: 12, padding: "14px 16px", border: "1px solid #fed7aa" },
};

// Inject spinner keyframe once
if (typeof document !== "undefined" && !document.getElementById("shop-spinner-style")) {
  const st = document.createElement("style");
  st.id = "shop-spinner-style";
  st.textContent = "@keyframes spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(st);
}
