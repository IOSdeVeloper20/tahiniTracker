import { useEffect, useState } from "react";

// ── Utilities ─────────────────────────────────────────────────────────────────
export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);
}
export function today() { return new Date().toISOString().slice(0, 10); }
export function thisMonth() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}
export function daysBetween(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
export function fmtEGP(n) { return `${Number(n || 0).toLocaleString()} EGP`; }

// ── Badge colour maps ─────────────────────────────────────────────────────────
export const STATUS_CLS = {
  pending:    "bg-gray-100 text-gray-600",
  confirmed:  "bg-blue-50 text-blue-700",
  packaged:   "bg-amber-50 text-amber-700",
  inDelivery: "bg-green-50 text-green-700",
  delivered:  "bg-emerald-50 text-emerald-700",
  cancelled:  "bg-red-50 text-red-600",
};
export const PAYMENT_CLS = {
  paid:   "bg-emerald-50 text-emerald-700",
  unpaid: "bg-red-50 text-red-600",
};
export const CAT_CLS = {
  productCost: "bg-blue-50 text-blue-700",
  packaging:   "bg-green-50 text-green-700",
  advertising: "bg-amber-50 text-amber-700",
  delivery:    "bg-orange-50 text-orange-700",
  other:       "bg-gray-100 text-gray-600",
};

// ── Small components ──────────────────────────────────────────────────────────
export function Badge({ label, cls }) {
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${cls || "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}

export function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg z-[9999] whitespace-nowrap">
      {msg}
    </div>
  );
}

export function OfflineBanner({ online, text }) {
  if (online) return null;
  return (
    <div className="bg-amber-50 text-amber-700 text-xs text-center px-3 py-1.5 border-b border-amber-200 flex items-center justify-center gap-1.5">
      <i className="ti ti-wifi-off text-sm" aria-hidden="true" /> {text}
    </div>
  );
}

export function ConfirmDialog({ message, yes: yesLabel, no: noLabel, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[300] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-xl">
        <p className="text-sm font-medium text-gray-800 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1">{noLabel}</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">{yesLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function FormSheet({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-[200]" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 pb-10 safe-bottom">
        {children}
      </div>
    </div>
  );
}

export function FormHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-base font-semibold text-gray-900">{title}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1" aria-label="Close">
        <i className="ti ti-x" />
      </button>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function FieldRow({ children }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

export function BackBtn({ label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
      <i className="ti ti-arrow-left text-base" aria-hidden="true" /> {label}
    </button>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <i className="ti ti-inbox text-4xl block mb-2" aria-hidden="true" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function MetricCard({ label, value, sub, color }) {
  return (
    <div className="metric-card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${color || "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function SectionTitle({ children }) {
  return <h2 className="section-title">{children}</h2>;
}

export function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all
            ${value === o.key
              ? "bg-brand-light text-brand-dark border-brand font-medium"
              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
