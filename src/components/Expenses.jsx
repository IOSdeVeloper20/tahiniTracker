import { useState } from "react";
import { tr, EXPENSE_CATS } from "../i18n";
import { uid, today, thisMonth, fmtEGP } from "./ui";
import { Badge, CAT_CLS, FormSheet, FormHeader, Field, FieldRow, EmptyState, SectionTitle, ConfirmDialog, MetricCard } from "./ui";

function ExpenseForm({ prefill, onSubmit, onClose, lang }) {
  const t = tr[lang];
  const [f, setF] = useState({
    date:     prefill.date     || today(),
    category: prefill.category || "productCost",
    amount:   prefill.amount   || "",
    notes:    prefill.notes    || "",
  });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <FormHeader title={prefill.id ? t.expenseUpdated : t.logExpense} onClose={onClose} />
      <Field label={t.category}>
        <select className="form-input" value={f.category} onChange={set("category")}>
          {EXPENSE_CATS.map(c => <option key={c.key} value={c.key}>{c[lang]}</option>)}
        </select>
      </Field>
      <FieldRow>
        <Field label={t.amount}><input className="form-input" type="number" value={f.amount} onChange={set("amount")} placeholder="0" /></Field>
        <Field label={t.date}><input className="form-input" type="date" value={f.date} onChange={set("date")} /></Field>
      </FieldRow>
      <Field label={t.notes}><input className="form-input" value={f.notes} onChange={set("notes")} placeholder={t.optional} /></Field>
      <button className="btn-primary mt-2" onClick={() => onSubmit({ ...f, id: prefill.id })}>
        <i className="ti ti-device-floppy me-1.5" aria-hidden="true" /> {t.save}
      </button>
    </div>
  );
}

export default function ExpensesScreen({ data, onSave, onDelete, showToast, lang }) {
  const t = tr[lang];
  const [form,    setForm]    = useState(null);
  const [confirm, setConfirm] = useState(null);
  const month = thisMonth();

  const monthExpenses = data.expenses.filter(e => e.date.startsWith(month));
  const monthTotal    = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const catTotals = {};
  monthExpenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount); });
  const topCat      = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat ? EXPENSE_CATS.find(c => c.key === topCat[0])?.[lang] || topCat[0] : "—";

  const submitExpense = fields => {
    const expense = { id: fields.id || uid(), date: fields.date, category: fields.category, amount: Number(fields.amount), notes: fields.notes || "" };
    onSave({ expense });
    showToast(fields.id ? t.expenseUpdated : t.expenseSaved);
    setForm(null);
  };

  const sorted = [...data.expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4">
      <button className="add-btn" onClick={() => setForm({})}>
        <i className="ti ti-circle-plus text-base" aria-hidden="true" /> {t.logExpense}
      </button>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <MetricCard label={t.thisMonth} value={fmtEGP(monthTotal)} color="text-amber-700 dark:text-amber-400" />
        <div className="metric-card">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t.largestItem}</p>
          {topCat
            ? <><p className="text-sm font-semibold text-gray-900 dark:text-white">{topCatLabel}</p><p className="text-xs text-gray-400 dark:text-gray-500">{fmtEGP(topCat[1])}</p></>
            : <p className="text-sm text-gray-400 dark:text-gray-500">—</p>}
        </div>
      </div>

      <SectionTitle>{t.allExpenses}</SectionTitle>
      {sorted.length === 0 && <EmptyState text={t.noData} />}
      {sorted.map(e => {
        const catLabel = EXPENSE_CATS.find(c => c.key === e.category)?.[lang] || e.category;
        return (
          <div key={e.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{catLabel}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{e.date}{e.notes ? ` · ${e.notes}` : ""}</p>
              </div>
              <div className="text-end flex flex-col items-end gap-1.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmtEGP(e.amount)}</p>
                <Badge label={catLabel} cls={CAT_CLS[e.category]} />
                <div className="flex gap-3">
                  <button onClick={() => setForm(e)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1">
                    <i className="ti ti-pencil text-xs" aria-hidden="true" /> {t.edit}
                  </button>
                  <button onClick={() => setConfirm(e.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <i className="ti ti-trash text-xs" aria-hidden="true" /> {t.delete}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {form && (
        <FormSheet onClose={() => setForm(null)}>
          <ExpenseForm prefill={form} onSubmit={submitExpense} onClose={() => setForm(null)} lang={lang} />
        </FormSheet>
      )}

      {confirm && (
        <ConfirmDialog
          message={t.confirmDelete} yes={t.yes} no={t.no}
          onConfirm={() => { onDelete("expenses", confirm); showToast(t.expenseDeleted); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
