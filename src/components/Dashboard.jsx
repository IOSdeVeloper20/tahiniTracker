import { useState } from "react";
import * as XLSX from "xlsx";
import { tr, MONTHS, EXPENSE_CATS, ORDER_STATUSES, PAYMENT_METHODS, label } from "../i18n";
import { thisMonth, daysBetween, fmtEGP } from "./ui";
import { MetricCard, SectionTitle, Badge, STATUS_CLS, PAYMENT_CLS } from "./ui";

function ExportCard({ data, lang }) {
  const t = tr[lang];
  const now = new Date();
  const currentMonth = thisMonth();
  const [exportMonth, setExportMonth] = useState(currentMonth);

  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { val, label: `${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}` };
  });

  const doExport = () => {
    const [yr, mo] = exportMonth.split("-").map(Number);
    const monthLabel = `${MONTHS[lang][mo - 1]} ${yr}`;
    const prefix = exportMonth;
    const cxName = id => data.customers.find(c => c.id === id)?.name || "—";
    const catLabel = k => EXPENSE_CATS.find(c => c.key === k)?.[lang] || k;
    const statusLabel = k => ORDER_STATUSES.find(s => s.key === k)?.[lang] || k;
    const methodLabel = k => PAYMENT_METHODS.find(m => m.key === k)?.[lang] || k;

    const mOrders = data.orders.filter(o => o.date.startsWith(prefix));
    const mExpenses = data.expenses.filter(e => e.date.startsWith(prefix));
    const validOrders = mOrders.filter(o => o.status !== "cancelled");
    const revenue = validOrders.reduce((s, o) => s + Number(o.total), 0);
    const totalExp = mExpenses.reduce((s, e) => s + Number(e.amount), 0);

    // Sheet 1 — Orders
    const wsOrders = XLSX.utils.json_to_sheet(mOrders.map(o => ({
      [lang === "ar" ? "التاريخ" : "Date"]: o.date,
      [lang === "ar" ? "العميل" : "Customer"]: cxName(o.customer_id),
      [lang === "ar" ? "المنتجات" : "Products"]: o.products,
      [lang === "ar" ? "الإجمالي" : "Total (EGP)"]: Number(o.total),
      [lang === "ar" ? "التوصيل" : "Delivery Fee"]: Number(o.delivery_fee || 0),
      [lang === "ar" ? "طريقة التوصيل" : "Delivery"]: o.delivery_method === "courier" ? `${lang === "ar" ? "شركة" : "Courier"}: ${o.courier_name}` : (lang === "ar" ? "شخصي" : "Self"),
      [lang === "ar" ? "الحالة" : "Status"]: statusLabel(o.status),
      [lang === "ar" ? "الدفع" : "Payment"]: lang === "ar" ? (o.payment_status === "paid" ? "مدفوع" : "غير مدفوع") : o.payment_status,
      [lang === "ar" ? "طريقة الدفع" : "Pay Method"]: methodLabel(o.payment_method),
      [lang === "ar" ? "ملاحظات" : "Notes"]: o.notes || "",
    })));

    // Sheet 2 — Expenses
    const wsExpenses = XLSX.utils.json_to_sheet(mExpenses.map(e => ({
      [lang === "ar" ? "التاريخ" : "Date"]: e.date,
      [lang === "ar" ? "الفئة" : "Category"]: catLabel(e.category),
      [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: Number(e.amount),
      [lang === "ar" ? "ملاحظات" : "Notes"]: e.notes || "",
    })));

    // Sheet 3 — Customers summary
    const cxMap = {};
    validOrders.forEach(o => {
      if (!cxMap[o.customer_id]) cxMap[o.customer_id] = { orders: 0, total: 0, paid: 0 };
      cxMap[o.customer_id].orders++;
      cxMap[o.customer_id].total += Number(o.total);
      if (o.payment_status === "paid") cxMap[o.customer_id].paid += Number(o.total);
    });
    const wsCustomers = XLSX.utils.json_to_sheet(
      Object.entries(cxMap)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([id, v]) => ({
          [lang === "ar" ? "العميل" : "Customer"]: cxName(id),
          [lang === "ar" ? "الطلبات" : "Orders"]: v.orders,
          [lang === "ar" ? "الإجمالي" : "Total Spent (EGP)"]: v.total,
          [lang === "ar" ? "تم تحصيله" : "Collected (EGP)"]: v.paid,
          [lang === "ar" ? "متبقي" : "Outstanding (EGP)"]: v.total - v.paid,
        }))
    );

    // Sheet 4 — Profit summary
    const wsSummary = XLSX.utils.json_to_sheet([
      { [lang === "ar" ? "البند" : "Item"]: lang === "ar" ? "الإيرادات" : "Revenue",           [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: revenue },
      { [lang === "ar" ? "البند" : "Item"]: lang === "ar" ? "إجمالي المصاريف" : "Total Expenses", [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: totalExp },
      { [lang === "ar" ? "البند" : "Item"]: lang === "ar" ? "الربح" : "Profit",                 [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: revenue - totalExp },
      { [lang === "ar" ? "البند" : "Item"]: lang === "ar" ? "هامش الربح %" : "Margin %",        [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: revenue > 0 ? Math.round((revenue - totalExp) / revenue * 100) : 0 },
      { [lang === "ar" ? "البند" : "Item"]: lang === "ar" ? "عدد الطلبات" : "Orders count",     [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: validOrders.length },
      { [lang === "ar" ? "البند" : "Item"]: lang === "ar" ? "متوسط الطلب" : "Avg order value",  [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: validOrders.length ? Math.round(revenue / validOrders.length) : 0 },
      { [lang === "ar" ? "البند" : "Item"]: lang === "ar" ? "عملاء جدد" : "New customers",      [lang === "ar" ? "المبلغ" : "Amount (EGP)"]: Object.values(cxMap).filter(v => v.orders === 1).length },
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsOrders,    lang === "ar" ? "الطلبات"  : "Orders");
    XLSX.utils.book_append_sheet(wb, wsExpenses,  lang === "ar" ? "المصاريف" : "Expenses");
    XLSX.utils.book_append_sheet(wb, wsCustomers, lang === "ar" ? "العملاء"  : "Customers");
    XLSX.utils.book_append_sheet(wb, wsSummary,   lang === "ar" ? "ملخص الأرباح" : "Profit Summary");
    XLSX.writeFile(wb, `Tahini-${monthLabel}.xlsx`);
  };

  return (
    <div className="card mb-3">
      <p className="text-sm font-medium text-gray-800 mb-0.5">{t.exportReport}</p>
      <p className="text-xs text-gray-400 mb-3">{t.exportDesc}</p>
      <div className="flex items-center gap-2">
        <select
          value={exportMonth}
          onChange={e => setExportMonth(e.target.value)}
          className="form-input flex-1 text-sm py-2">
          {monthOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
        <button onClick={doExport}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark whitespace-nowrap">
          <i className="ti ti-download text-base" aria-hidden="true" /> {t.export}
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ data, lang, onGoToCustomer }) {
  const t = tr[lang];
  const now = new Date();
  const month = thisMonth();
  const todayStr = now.toISOString().slice(0, 10);
  const statuses = ORDER_STATUSES;

  // Derived numbers
  const monthOrders  = data.orders.filter(o => o.date.startsWith(month) && o.status !== "cancelled");
  const todayOrders  = data.orders.filter(o => o.date === todayStr && o.status !== "cancelled");
  const monthRevenue = monthOrders.reduce((s, o) => s + Number(o.total), 0);
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const monthExp     = data.expenses.filter(e => e.date.startsWith(month)).reduce((s, e) => s + Number(e.amount), 0);
  const profit       = monthRevenue - monthExp;
  const margin       = monthRevenue > 0 ? Math.round(profit / monthRevenue * 100) : 0;
  const avgOrder     = monthOrders.length ? Math.round(monthRevenue / monthOrders.length) : 0;

  // Customer stats
  const cxOrders = {};
  data.orders.filter(o => o.status !== "cancelled").forEach(o => {
    if (!cxOrders[o.customer_id]) cxOrders[o.customer_id] = [];
    cxOrders[o.customer_id].push(o);
  });
  const monthCxIds = new Set(monthOrders.map(o => o.customer_id));
  const newCx = [...monthCxIds].filter(id => (cxOrders[id] || []).length === 1).length;
  const retCx = [...monthCxIds].filter(id => (cxOrders[id] || []).length  >  1).length;

  // Action items
  const toPack    = data.orders.filter(o => o.status === "confirmed").length;
  const inDel     = data.orders.filter(o => o.status === "inDelivery").length;
  const unpaid    = data.orders.filter(o => o.payment_status === "unpaid" && o.status === "delivered");
  const unpaidAmt = unpaid.reduce((s, o) => s + Number(o.total), 0);

  // Follow-up (no order in 14+ days)
  const followUp = data.customers.map(c => {
    const orders = (cxOrders[c.id] || []);
    const last = [...orders].sort((a, b) => b.date.localeCompare(a.date))[0];
    const days = daysBetween(last?.date);
    return { ...c, days, lastDate: last?.date };
  }).filter(c => c.days !== null && c.days >= 14).sort((a, b) => b.days - a.days);

  return (
    <div className="p-4">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
        <MetricCard label={t.todaySales}   value={fmtEGP(todayRevenue)}  sub={`${todayOrders.length} ${t.orders || "orders"}`} color="text-brand-dark" />
        <MetricCard label={t.monthRevenue} value={fmtEGP(monthRevenue)}  sub={`${monthOrders.length} ${t.orders || "orders"}`} />
        <MetricCard label={t.newCustomers} value={newCx} />
        <MetricCard label={t.returning}    value={retCx} color="text-orange-600" />
        <MetricCard label={t.avgOrder}     value={fmtEGP(avgOrder)} />
        <MetricCard label={t.totalExpenses} value={fmtEGP(monthExp)} color="text-amber-700" />
      </div>

      {/* Profit card */}
      <div className="card mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">{t.monthlyProfit}</span>
          <span className="text-xs text-gray-400">{MONTHS[lang][now.getMonth()]} {now.getFullYear()}</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-2xl font-semibold ${profit >= 0 ? "text-brand-dark" : "text-red-600"}`}>{fmtEGP(profit)}</span>
          <span className="text-sm text-gray-400">{margin}% {t.margin}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${monthRevenue > 0 ? Math.min(100, Math.round(monthExp / monthRevenue * 100)) : 0}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{t.costs}: {fmtEGP(monthExp)}</span>
          <span>{t.revenue}: {fmtEGP(monthRevenue)}</span>
        </div>
      </div>

      {/* Action items */}
      {(toPack > 0 || inDel > 0 || unpaid.length > 0) && (
        <div className="mb-3">
          <SectionTitle>{lang === "ar" ? "يحتاج تصرف" : "Action needed"}</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {toPack > 0 && (
              <div className="metric-card text-center">
                <p className="text-xl font-semibold text-amber-700">{toPack}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.toPackToday}</p>
              </div>
            )}
            {inDel > 0 && (
              <div className="metric-card text-center">
                <p className="text-xl font-semibold text-green-700">{inDel}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.inDelivery}</p>
              </div>
            )}
            {unpaid.length > 0 && (
              <div className="metric-card text-center">
                <p className="text-xl font-semibold text-red-600">{fmtEGP(unpaidAmt)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.unpaidOrders}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export */}
      <ExportCard data={data} lang={lang} />

      {/* Follow-up */}
      {followUp.length > 0 && (
        <div>
          <SectionTitle>{t.followUp} ({followUp.length})</SectionTitle>
          {followUp.slice(0, 5).map(c => (
            <div key={c.id} onClick={() => onGoToCustomer(c.id)}
              className="card border-s-4 border-s-amber-400 rounded-s-none cursor-pointer hover:bg-gray-50 active:scale-[0.99]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.area} · {lang === "ar" ? "آخر طلب" : "last order"} {c.lastDate}</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{c.days} {t.daysAgo}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
