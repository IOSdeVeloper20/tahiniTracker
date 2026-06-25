import { useState } from "react";
import { tr, ORDER_STATUSES, PAYMENT_METHODS } from "../i18n";
import { uid, today, daysBetween, fmtEGP } from "./ui";
import { Badge, STATUS_CLS, PAYMENT_CLS, FormSheet, FormHeader, Field, FieldRow, BackBtn, EmptyState, SectionTitle, ConfirmDialog } from "./ui";
import { OrderForm } from "./Orders";

// ── Customer Form ─────────────────────────────────────────────────────────────
function CustomerForm({ prefill, onSubmit, onClose, lang }) {
  const t = tr[lang];
  const [f, setF] = useState({ name: prefill.name || "", phone: prefill.phone || "", area: prefill.area || "" });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <div>
      <FormHeader title={prefill.id ? `${t.edit} ${t.customer}` : t.newCustomerBtn} onClose={onClose} />
      <Field label={t.name}><input className="form-input" value={f.name} onChange={set("name")} placeholder={t.namePh} /></Field>
      <Field label={t.phone}><input className="form-input" type="tel" value={f.phone} onChange={set("phone")} placeholder={t.phonePh} /></Field>
      <Field label={t.area}><input className="form-input" value={f.area} onChange={set("area")} placeholder={t.areaPh} /></Field>
      <button className="btn-primary mt-2" onClick={() => onSubmit({ ...f, id: prefill.id })}>{t.save}</button>
    </div>
  );
}

// ── Customer Detail ───────────────────────────────────────────────────────────
function CustomerDetail({ customer, orders, onEdit, onDelete, onNewOrder, onBack, lang }) {
  const t = tr[lang];
  const [confirm, setConfirm] = useState(false);

  const cxOrders = orders.filter(o => o.customer_id === customer.id);
  const validOrders = cxOrders.filter(o => o.status !== "cancelled");
  const totalSpent = validOrders.reduce((s, o) => s + Number(o.total), 0);
  const lastOrder = [...validOrders].sort((a, b) => b.date.localeCompare(a.date))[0];
  const daysSince = daysBetween(lastOrder?.date);
  const isNew = validOrders.length <= 1;
  const uncollected = validOrders.filter(o => o.payment_status === "unpaid").reduce((s, o) => s + Number(o.total), 0);

  const rows = [
    [t.phone,       customer.phone || "—"],
    [t.area,        customer.area  || "—"],
    [t.memberSince, customer.created_at],
    [t.ordersCount, validOrders.length],
    [t.totalSpent,  fmtEGP(totalSpent)],
    [t.lastOrder,   lastOrder?.date || "—"],
    ...(daysSince !== null ? [[lang === "ar" ? "منذ آخر طلب" : "Days since last order", `${daysSince} ${t.daysAgo}${daysSince >= 14 ? " ⚠️" : ""}`]] : []),
    ...(uncollected > 0 ? [[t.outstanding || "Outstanding", fmtEGP(uncollected)]] : []),
  ];

  return (
    <div>
      <BackBtn label={t.back} onClick={onBack} />
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">{customer.name}</h2>
          <Badge
            label={isNew ? t.newBadge : t.returningBadge}
            cls={isNew ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}
          />
        </div>
        {rows.map(([l, v]) => (
          <div key={l} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
            <span className="text-gray-500">{l}</span>
            <span className="font-medium text-gray-900">{v}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <button className="btn-ghost" onClick={onEdit}>{t.edit}</button>
          <button className="flex-1 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark" onClick={onNewOrder}>+ {t.newOrder}</button>
          <button className="btn-danger" onClick={() => setConfirm(true)}>{t.delete}</button>
        </div>
      </div>

      {/* Order history */}
      {cxOrders.length > 0 && (
        <div className="mt-4">
          <SectionTitle>{t.orderHistory}</SectionTitle>
          {[...cxOrders].sort((a, b) => b.date.localeCompare(a.date)).map(o => {
            const statusLabel = ORDER_STATUSES.find(s => s.key === o.status)?.[lang] || o.status;
            return (
              <div key={o.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.products}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{o.date}</p>
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
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          message={t.confirmDelete} yes={t.yes} no={t.no}
          onConfirm={() => { onDelete(customer.id); setConfirm(false); }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </div>
  );
}

// ── Customers Screen ──────────────────────────────────────────────────────────
export default function CustomersScreen({ data, onSave, onDelete, showToast, lang, initialCustomer, onClearInitial }) {
  const t = tr[lang];
  const [selected, setSelected] = useState(initialCustomer || null);
  const [form, setForm] = useState(null);
  const [orderForm, setOrderForm] = useState(false);

  // Enrich customers with computed stats
  const enriched = data.customers.map(c => {
    const orders = data.orders.filter(o => o.customer_id === c.id && o.status !== "cancelled");
    const total = orders.reduce((s, o) => s + Number(o.total), 0);
    const last = [...orders].sort((a, b) => b.date.localeCompare(a.date))[0];
    return { ...c, orderCount: orders.length, totalSpent: total, lastDate: last?.date, isNew: orders.length <= 1 };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  const submitCustomer = fields => {
    const customer = { id: fields.id || uid(), name: fields.name, phone: fields.phone, area: fields.area, created_at: fields.created_at || today() };
    onSave({ customer });
    showToast(fields.id ? t.customerUpdated : t.customerSaved);
    setForm(null);
  };

  const submitOrderFromCx = fields => {
    let customerId = selected;
    let newCustomer = null;
    if (!customerId && fields.newName?.trim()) {
      newCustomer = { id: uid(), name: fields.newName, phone: fields.phone, area: fields.area, created_at: today() };
      customerId = newCustomer.id;
    }
    const order = {
      id: fields.id || uid(), customer_id: customerId, date: fields.date,
      products: fields.products, total: Number(fields.total),
      delivery_fee: Number(fields.deliveryFee) || 0,
      delivery_method: fields.deliveryMethod, courier_name: fields.courierName || "",
      tracking_number: fields.trackingNo || "", status: fields.status,
      payment_status: fields.paymentStatus, payment_method: fields.paymentMethod, notes: fields.notes || "",
    };
    onSave({ order, newCustomer });
    showToast(t.orderSaved);
    setOrderForm(false);
  };

  const selectedCx = data.customers.find(c => c.id === selected);

  return (
    <div className="p-4">
      {!selected && (
        <>
          <button className="add-btn" onClick={() => setForm({})}>
            <i className="ti ti-plus text-base" aria-hidden="true" /> {t.newCustomerBtn}
          </button>
          <SectionTitle>{t.allCustomers} ({enriched.length})</SectionTitle>
          {enriched.length === 0 && <EmptyState text={t.noData} />}
          {enriched.map(c => (
            <div key={c.id} className="card cursor-pointer hover:bg-gray-50 active:scale-[0.99]" onClick={() => setSelected(c.id)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.area} · {c.phone}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-semibold text-gray-900">{fmtEGP(c.totalSpent)}</p>
                  <div className="mt-1">
                    <Badge
                      label={c.isNew ? t.newBadge : t.returningBadge}
                      cls={c.isNew ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{c.orderCount} {t.ordersCount} · {t.lastOrder}: {c.lastDate || "—"}</p>
            </div>
          ))}
        </>
      )}

      {selected && selectedCx && !form && !orderForm && (
        <CustomerDetail
          customer={selectedCx} orders={data.orders} lang={lang}
          onBack={() => { setSelected(null); if (onClearInitial) onClearInitial(); }}
          onEdit={() => setForm(selectedCx)}
          onNewOrder={() => setOrderForm(true)}
          onDelete={id => { onDelete("customers", id); setSelected(null); showToast(t.customerDeleted); }}
        />
      )}

      {form && (
        <FormSheet onClose={() => setForm(null)}>
          <CustomerForm prefill={form} onSubmit={submitCustomer} onClose={() => setForm(null)} lang={lang} />
        </FormSheet>
      )}

      {orderForm && (
        <FormSheet onClose={() => setOrderForm(false)}>
          <OrderForm
            prefill={{ customerId: selected }}
            customers={data.customers}
            onSubmit={submitOrderFromCx}
            onClose={() => setOrderForm(false)}
            lang={lang}
          />
        </FormSheet>
      )}
    </div>
  );
}
