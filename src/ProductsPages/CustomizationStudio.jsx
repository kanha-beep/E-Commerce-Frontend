import { useMemo, useState } from "react";
import { AccentButton, Panel, TextArea, TextInput } from "../components/ui.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { launchRazorpayCheckout } from "../utils/payments.js";
import { api } from "../../api.js";

const initialCustomization = {
  tagText: "Original Tag",
  printText: "Custom Drop",
  baseColor: "#f8fafc",
  accentColor: "#0f172a",
  rotation: 0,
  printSize: 100,
  extraCharge: 499,
  improvementNote: "",
};

export default function CustomizationStudio({
  product,
  isOwner,
  customOrders,
  onSubmit,
  onStatusChange,
  buyerName,
  onPaymentSuccess,
  onPaymentError,
}) {
  const [form, setForm] = useState(initialCustomization);
  const [saving, setSaving] = useState(false);
  const total = useMemo(
    () => Number(product?.price || 0) + Number(form.extraCharge || 0),
    [product?.price, form.extraCharge]
  );
  const [payingOrderId, setPayingOrderId] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      setForm(initialCustomization);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isOwner ? (
        <Panel id="customization-studio">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Customization studio
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-950">Live 3D-style preview</h3>
            </div>
            <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              Total {formatCurrency(total)}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <LiveCustomizationPreview productName={product.name} preview={form} />

            <form className="space-y-4" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tag text">
                  <TextInput
                    value={form.tagText}
                    onChange={(e) => setForm((current) => ({ ...current, tagText: e.target.value }))}
                  />
                </Field>
                <Field label="Front print">
                  <TextInput
                    value={form.printText}
                    onChange={(e) => setForm((current) => ({ ...current, printText: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Base color">
                  <input
                    type="color"
                    value={form.baseColor}
                    onChange={(e) => setForm((current) => ({ ...current, baseColor: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white p-2"
                  />
                </Field>
                <Field label="Accent color">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm((current) => ({ ...current, accentColor: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white p-2"
                  />
                </Field>
              </div>

              <Field label={`Print size ${form.printSize}%`}>
                <input
                  type="range"
                  min="70"
                  max="140"
                  value={form.printSize}
                  onChange={(e) => setForm((current) => ({ ...current, printSize: Number(e.target.value) }))}
                  className="w-full accent-slate-950"
                />
              </Field>

              <Field label={`Rotation ${form.rotation}deg`}>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={form.rotation}
                  onChange={(e) => setForm((current) => ({ ...current, rotation: Number(e.target.value) }))}
                  className="w-full accent-slate-950"
                />
              </Field>

              <Field label="Extra charge for custom work">
                <TextInput
                  type="number"
                  min="0"
                  value={form.extraCharge}
                  onChange={(e) => setForm((current) => ({ ...current, extraCharge: e.target.value }))}
                />
              </Field>

              <Field label="Message to producer">
                <TextArea
                  value={form.improvementNote}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, improvementNote: e.target.value }))
                  }
                  placeholder="I like the t-shirt, but I want a softer neck tag, matte black front print, and a slightly oversized fit."
                />
              </Field>

              <AccentButton type="submit" disabled={saving}>
                {saving ? "Sending request..." : "Send custom request to producer"}
              </AccentButton>
            </form>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Custom requests
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">
              {isOwner ? "Incoming producer work" : "Your custom orders"}
            </h3>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {customOrders.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              No custom requests yet for this product.
            </p>
          ) : (
            customOrders.map((order) => (
              <article key={order._id} className="rounded-[1.5rem] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {isOwner
                          ? `Buyer: ${order.buyer?.username || "Customer"}`
                          : `Producer: ${order.producer?.username || "Seller"}`}
                      </span>
                      <CustomOrderStatus status={order.status} />
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{order.improvementNote}</p>
                    <div className="flex flex-wrap gap-4 text-sm font-medium">
                      <span className="text-slate-500">
                        Extra charge {formatCurrency(order.extraCharge)}
                      </span>
                      <span className="text-slate-950">Total {formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="w-full max-w-[220px]">
                    <LiveCustomizationPreview
                      productName={product.name}
                      preview={{ ...initialCustomization, ...order.preview }}
                      compact
                    />
                  </div>
                </div>

                {isOwner ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["accepted", "in-production", "shipped", "rejected"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => onStatusChange(order._id, status)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                ) : order.paymentStatus !== "paid" &&
                  ["accepted", "in-production"].includes(order.status) ? (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleCustomPayment(order._id)}
                      disabled={payingOrderId === order._id}
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {payingOrderId === order._id ? "Processing payment..." : "Pay custom order"}
                    </button>
                  </div>
                ) : !isOwner ? (
                  <div className="mt-4 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    {order.paymentStatus === "paid" ? "Payment completed" : "Waiting for producer approval"}
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </Panel>
    </div>
  );

  async function handleCustomPayment(customOrderId) {
    try {
      setPayingOrderId(customOrderId);
      const orderRes = await api.post(`/api/products/custom-orders/${customOrderId}/payment-order`);
      const paymentResult = await launchRazorpayCheckout({
        ...orderRes.data,
        prefill: { name: buyerName || "" },
      });

      await api.post(`/api/products/custom-orders/${customOrderId}/payment-verify`, {
        razorpay_order_id: paymentResult.razorpay_order_id,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      });

      await onPaymentSuccess?.();
    } catch (error) {
      onPaymentError?.(error);
    } finally {
      setPayingOrderId("");
    }
  }
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function CustomOrderStatus({ status }) {
  const toneMap = {
    pending: "bg-amber-50 text-amber-700",
    accepted: "bg-sky-50 text-sky-700",
    "in-production": "bg-violet-50 text-violet-700",
    shipped: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneMap[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export function LiveCustomizationPreview({ productName, preview, compact = false }) {
  const bodyColor = preview.baseColor || "#f8fafc";
  const accentColor = preview.accentColor || "#0f172a";

  return (
    <div className={`${compact ? "min-h-[220px]" : "min-h-[360px]"}`}>
      <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_30%),linear-gradient(180deg,_#e2e8f0,_#f8fafc)] p-6 shadow-inner">
        <div className="mx-auto flex justify-center [perspective:1200px]">
          <div
            className={`relative ${compact ? "h-[210px] w-[170px]" : "h-[320px] w-[250px]"}`}
            style={{ transform: "rotateX(10deg) rotateY(-18deg)", transformStyle: "preserve-3d" }}
          >
            <div className="absolute -left-8 top-16 h-28 w-12 rounded-l-[2rem] opacity-95" style={{ background: bodyColor }} />
            <div className="absolute -right-8 top-16 h-28 w-12 rounded-r-[2rem] opacity-95" style={{ background: bodyColor }} />
            <div
              className="absolute inset-0 rounded-[2.4rem] shadow-[0_30px_55px_rgba(15,23,42,0.2)]"
              style={{ background: `linear-gradient(145deg, ${bodyColor}, ${mixColor(bodyColor, "#111827", 0.12)})` }}
            />
            <div
              className="absolute left-1/2 top-9 z-10 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.32em]"
              style={{
                transform: "translateX(-50%) translateZ(20px)",
                backgroundColor: accentColor,
                color: readableText(accentColor),
              }}
            >
              {preview.tagText}
            </div>
            <div
              className="absolute inset-x-6 top-20 rounded-[1.8rem] border border-white/25 bg-white/25 backdrop-blur-sm"
              style={{
                height: compact ? "84px" : "110px",
                transform: `translateZ(35px) rotate(${preview.rotation}deg) scale(${Number(preview.printSize) / 100})`,
              }}
            />
            <div
              className="absolute inset-x-10 top-24 z-20 text-center font-black uppercase tracking-[0.18em]"
              style={{
                color: accentColor,
                fontSize: compact ? "0.75rem" : "1rem",
                transform: `translateZ(40px) rotate(${preview.rotation}deg) scale(${Number(preview.printSize) / 100})`,
              }}
            >
              {preview.printText}
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live preview</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{productName}</p>
        </div>
      </div>
    </div>
  );
}

function mixColor(colorA, colorB, weight) {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  const mix = (a, b) => Math.round(a + (b - a) * weight);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

function readableText(background) {
  const [r, g, b] = hexToRgb(background);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;
  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
