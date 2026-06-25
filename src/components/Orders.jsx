import { useState, useMemo } from "react";
import { tr, ORDER_STATUSES, PAYMENT_METHODS, DELIVERY_METHODS } from "../i18n";
import { uid, today, fmtEGP } from "./ui";
import { Badge, STATUS_CLS, PAYMENT_CLS, FormSheet, FormHeader, Field, FieldRow, BackBtn, EmptyState, SectionTitle, ConfirmDialog, ToggleGroup } from "./ui";

// ── Smart customer search ─────────────────────────────────────────────────────
function CustomerSearch({ customers, value, onSelect, lang }) {
  const t = tr[lang];
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (query.trim().length < 1) return [];
    const q = query.toLowerCase();
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
    ).slice(0, 6);
  }, [query, customers]);

  const selected = customers.find(c => c.id === value);

  if (selected) {
    return (
      <div className="flex items-center justify-between p-3 border border-brand rounded-lg bg-brand-light">
        <div>
          <p className="text-sm font-medium text-brand-dark">{selected.name}</p>
          <p className="text-xs text-brand mt-0.5">{selected.phone} · {selected.area}</p>
        </div>
        <button onClick={() => onSelect(null)} className="text-brand hover:text-brand-dark text-lg leading-none p-1">✕</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        className="form-input"
        placeholder={t.searchCustomer}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full start-0 end-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-1 overflow-hidden">
          {results.map(c => (
            <div key={c.id}
              onMouseDown={() => { onSelect(c.id); setQuery(""); setOpen(false); }}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400">{c.phone} · {c.area}</p>
              </div>
              <i className="ti ti-user-check text-brand text-base" aria-hidden="true" />
            </div>
          ))}
        </div>
      )}
      {open && query.length >= 1 && results.length === 0 && (
        <div className="absolute top-full start-0 end-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-1 px-3 py-2.5 text-sm text-gray-400">
          <i className="ti ti-user-plus me-1.5" aria-hidden="true" />
          {t.orAddNew}
        </div>
      )}
    </div>
  );
}

// ── Order Form ────────────────────────────────────────────────────────────────
function OrderForm({ prefill, customers, onSubmit, onClose, lang }) {
  const t = tr[lang];
  const [f, setF] = useState({
    customerId:     prefill.customer_id    || prefill.customerId    || "",
    newName:        "",
    phone:          "",
    area:           "",
    date:           prefill.date           || today(),
    products:       prefill.products       || "",
    total:          prefill.total          || "",
    deliveryFee:    prefill.delivery_fee   || "",
    deliveryMethod: prefill.delivery_method|| "self",
    courierName:    prefill.courier_name   || "",
    trackingNo:     prefill.tracking_number|| "",
    status:         prefill.status         || "pending",
    paymentStatus:  prefill.payment_status || "unpaid",
    paymentMethod:  prefill.payment_method || "cash",
    notes:          prefill.notes          || "",
  });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const toggle = (k, v) => setF(p => ({ ...p, [k]: v }));

  const canSubmit = (f.customerId || f.newName.trim()) && f.products.trim() && f.total;

  return (
    <div>
      <FormHeader title={prefill.id ? t.editOrder : t.newOrder} onClose={onClose} />

      {/* Customer search */}
      <Field label={t.customer}>
        <CustomerSearch customers={customers} value={f.customerId} onSelect={v => toggle("customerId", v)} lang={lang} />
      </Field>

      {/* New customer fields */}
      {!f.customerId && (
        <div className="bg-gray-50 rounded-xl p-3 mb-3">
          <p className="text-xs text-gray-500 mb-2">{t.newCustomerSection}</p>
          <Field label={t.name}><input className="form-input" value={f.newName} onChange={set("newName")} placeholder={t.namePh} /></Field>
          <FieldRow>
            <Field label={t.phone}><input className="form-input" type="tel" value={f.phone} onChange={set("phone")} placeholder={t.phonePh} /></Field>
            <Field label={t.area}><input className="form-input" value={f.area} onChange={set("area")} placeholder={t.areaPh} /></Field>
          </FieldRow>
        </div>
      )}

      <Field label={t.date}><input className="form-input" type="date" value={f.date} onChange={set("date")} /></Field>
      <Field label={t.products}><textarea className="form-input resize-none" rows={2} value={f.products} onChange={set("products")} placeholder={t.productsPh} /></Field>

      <FieldRow>
        <Field label={t.total}><input className="form-input" type="number" value={f.total} onChange={set("total")} placeholder="0" /></Field>
        <Field label={t.deliveryFee}><input className="form-input" type="number" value={f.deliveryFee} onChange={set("deliveryFee")} placeholder="0" /></Field>
      </FieldRow>

      {/* Status */}
      <Field label={t.status}>
        <select className="form-input" value={f.status} onChange={set("status")}>
          {ORDER_STATUSES.map(s => <option key={s.key} value={s.key}>{s[lang]}</option>)}
        </select>
      </Field>

      {/* Delivery method toggle */}
      <Field label={t.deliveryMethod}>
        <ToggleGroup
          options={DELIVERY_METHODS.map(d => ({ key: d.key, label: d[lang] }))}
          value={f.deliveryMethod}
          onChange={v => toggle("deliveryMethod", v)}
        />
      </Field>
      {f.deliveryMethod === "courier" && (
        <FieldRow>
          <Field label={t.courierName}><input className="form-input" value={f.courierName} onChange={set("courierName")} placeholder={t.courierPh} /></Field>
          <Field label={t.trackingNo}><input className="form-input" value={f.trackingNo} onChange={set("trackingNo")} placeholder="#" /></Field>
        </FieldRow>
      )}

      {/* Payment */}
      <FieldRow>
        <Field label={t.paymentStatus}>
          <ToggleGroup
            options={[{ key:"unpaid", label: t.unpaid }, { key:"paid", label: t.paid }]}
            value={f.paymentStatus}
            onChange={v => toggle("paymentStatus", v)}
          />
        </Field>
        <Field label={t.paymentMethod}>
          <select className="form-input" value={f.paymentMethod} onChange={set("paymentMethod")}>
            {PAYMENT_METHODS.map(m => <option key={m.key} value={m.key}>{m[lang]}</option>)}
          </select>
        </Field>
      </FieldRow>

      <Field label={t.notes}><input className="form-input" value={f.notes} onChange={set("notes")} placeholder={t.optional} /></Field>

      <button
        className={`btn-primary mt-2 ${!canSubmit ? "opacity-40 cursor-not-allowed" : ""}`}
        disabled={!canSubmit}
        onClick={() => onSubmit({ ...f, id: prefill.id })}>
        {prefill.id ? t.save : t.newOrder}
      </button>
    </div>
  );
}

// ── Order Detail ──────────────────────────────────────────────────────────────
function OrderDetail({ order, customers, onEdit, onDelete, onBack, lang }) {
  const t = tr[lang];
  const [confirm, setConfirm] = useState(false);
  const cx = customers.find(c => c.id === order.customer_id);
  const statusLabel = ORDER_STATUSES.find(s => s.key === order.status)?.[lang] || order.status;
  const methodLabel = PAYMENT_METHODS.find(m => m.key === order.payment_method)?.[lang] || "";
  const delLabel = order.delivery_method === "courier"
    ? `${DELIVERY_METHODS.find(d => d.key === "courier")?.[lang]} — ${order.courier_name || ""}${order.tracking_number ? ` (#${order.tracking_number})` : ""}`
    : DELIVERY_METHODS.find(d => d.key === "self")?.[lang];

  const rows = [
    [t.customer, cx?.name || "—"],
    [t.date, order.date],
    [t.products, order.products],
    [t.total, fmtEGP(order.total)],
    [t.deliveryFee, fmtEGP(order.delivery_fee)],
    [t.deliveryMethod, delLabel],
    [t.paymentMethod, methodLabel],
    [t.notes, order.notes || "—"],
  ];

  return (
    <div>
      <BackBtn label={t.back} onClick={onBack} />
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">#{order.id.slice(0, 8)}</span>
          <div className="flex gap-1.5">
            <Badge label={statusLabel} cls={STATUS_CLS[order.status]} />
            <Badge label={order.payment_status === "paid" ? t.paid : t.unpaid} cls={PAYMENT_CLS[order.payment_status]} />
          </div>
        </div>
        {rows.map(([l, v]) => (
          <div key={l} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
            <span className="text-gray-500">{l}</span>
            <span className="font-medium text-gray-900 text-end max-w-[60%]">{v}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <button className="btn-ghost" onClick={onEdit}>{t.edit}</button>
          <button className="btn-danger" onClick={() => setConfirm(true)}>{t.delete}</button>
        </div>
      </div>
      {confirm && <ConfirmDialog message={t.confirmDelete} yes={t.yes} no={t.no} onConfirm={() => { onDelete(order.id); setConfirm(false); }} onCancel={() => setConfirm(false)} />}
    </div>
  );
}

// ── Orders Screen ─────────────────────────────────────────────────────────────
export default function OrdersScreen({ data, onSave, onDelete, showToast, lang, initialOrder, onClearInitial }) {
  const t = tr[lang];
  const [selected, setSelected] = useState(initialOrder || null);
  const [form, setForm] = useState(null);

  const submitOrder = fields => {
    let customerId = fields.customerId;
    let newCustomer = null;
    if (!customerId && fields.newName?.trim()) {
      newCustomer = { id: uid(), name: fields.newName.trim(), phone: fields.phone, area: fields.area, created_at: today() };
      customerId = newCustomer.id;
    }
    const order = {
      id: fields.id || uid(),
      customer_id:      customerId,
      date:             fields.date,
      products:         fields.products,
      total:            Number(fields.total),
      delivery_fee:     Number(fields.deliveryFee) || 0,
      delivery_method:  fields.deliveryMethod,
      courier_name:     fields.courierName || "",
      tracking_number:  fields.trackingNo || "",
      status:           fields.status,
      payment_status:   fields.paymentStatus,
      payment_method:   fields.paymentMethod,
      notes:            fields.notes || "",
    };
    onSave({ order, newCustomer });
    showToast(fields.id ? t.orderUpdated : t.orderSaved);
    setForm(null);
  };

  const sorted = [...data.orders].sort((a, b) => b.date.localeCompare(a.date));
  const selectedOrder = data.orders.find(o => o.id === selected);

  return (
    <div className="p-4">
      {!form && !selectedOrder && (
        <>
          <button className="add-btn" onClick={() => setForm({})}>
            <i className="ti ti-plus text-base" aria-hidden="true" /> {t.newOrder}
          </button>
          <SectionTitle>{t.allOrders}</SectionTitle>
          {sorted.length === 0 && <EmptyState text={t.noData} />}
          {sorted.map(o => {
            const cx = data.customers.find(c => c.id === o.customer_id);
            const statusLabel = ORDER_STATUSES.find(s => s.key === o.status)?.[lang] || o.status;
            return (
              <div key={o.id} className="card cursor-pointer hover:bg-gray-50 active:scale-[0.99]" onClick={() => setSelected(o.id)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cx?.name || "—"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{o.date} · {o.products}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-semibold text-gray-900">{fmtEGP(o.total)}</p>
                    <div className="flex gap-1 mt-1 justify-end">
                      <Badge label={statusLabel} cls={STATUS_CLS[o.status]} />
                      <Badge label={o.payment_status === "paid" ? t.paid : t.unpaid} cls={PAYMENT_CLS[o.payment_status]} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {selectedOrder && !form && (
        <OrderDetail
          order={selectedOrder} customers={data.customers} lang={lang}
          onBack={() => { setSelected(null); if (onClearInitial) onClearInitial(); }}
          onEdit={() => setForm(selectedOrder)}
          onDelete={id => { onDelete("orders", id); setSelected(null); showToast(t.orderDeleted); }}
        />
      )}

      {form && (
        <FormSheet onClose={() => setForm(null)}>
          <OrderForm
            prefill={form}
            customers={data.customers}
            onSubmit={submitOrder}
            onClose={() => setForm(null)}
            lang={lang}
          />
        </FormSheet>
      )}
    </div>
  );
}

export { OrderForm };
