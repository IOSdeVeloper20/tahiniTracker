import { useState, useEffect, useCallback } from "react";
import { tr } from "./i18n";
import { fetchAll, upsertRow, deleteRow, EMPTY_DATA } from "./db";
import { Toast, OfflineBanner } from "./components/ui";
import Dashboard  from "./components/Dashboard";
import OrdersScreen   from "./components/Orders";
import CustomersScreen from "./components/Customers";
import ExpensesScreen  from "./components/Expenses";

const LANG_KEY = "tahini_lang";

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || "ar");
  const [data, setData] = useState(EMPTY_DATA);
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("dashboard");
  const [toast, setToast] = useState(null);
  // Cross-screen navigation state
  const [jumpCustomer, setJumpCustomer] = useState(null);
  const [jumpOrder, setJumpOrder] = useState(null);

  const t = tr[lang];
  const isRTL = lang === "ar";

  // Apply RTL to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang, isRTL]);

  // Load data on mount
  useEffect(() => {
    fetchAll().then(({ data: d, online: isOnline }) => {
      setData(d);
      setOnline(isOnline);
      setLoading(false);
    });
  }, []);

  // Online/offline detection
  useEffect(() => {
    const goOnline  = () => { setOnline(true);  fetchAll().then(({ data: d }) => setData(d)); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  const showToast = msg => setToast(msg);

  // ── Save handler (orders, customers, expenses) ────────────────────────────
  const handleSave = useCallback(async ({ order, newCustomer, customer, expense }) => {
    if (newCustomer) await upsertRow("customers", newCustomer, data, setData);
    if (order)       await upsertRow("orders",    order,       data, setData);
    if (customer)    await upsertRow("customers", customer,    data, setData);
    if (expense)     await upsertRow("expenses",  expense,     data, setData);
  }, [data]);

  const handleDelete = useCallback(async (table, id) => {
    await deleteRow(table, id, data, setData);
  }, [data]);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goToCustomer = id => { setJumpCustomer(id); setScreen("customers"); };
  const goToOrder    = id => { setJumpOrder(id);    setScreen("orders");    };

  // ── Nav items ─────────────────────────────────────────────────────────────
  const nav = [
    { id:"dashboard", icon:"ti-chart-bar",    label: t.dashboard  },
    { id:"orders",    icon:"ti-shopping-cart", label: t.orders     },
    { id:"customers", icon:"ti-users",         label: t.customers  },
    { id:"expenses",  icon:"ti-receipt",       label: t.expenses   },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-400">
        <i className="ti ti-loader-2 text-4xl animate-spin text-brand" aria-hidden="true" />
        <p className="text-sm">{isRTL ? "جاري التحميل…" : "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto relative">

      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 safe-top flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-base font-semibold text-gray-900">{t.appName}</h1>
        <div className="flex items-center gap-2">
          {!online && <span className="w-2 h-2 rounded-full bg-amber-400" title="Offline" />}
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            {lang === "ar" ? "EN" : "العربية"}
          </button>
        </div>
      </header>

      <OfflineBanner online={online} text={t.offline} />

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {screen === "dashboard" && (
          <Dashboard data={data} lang={lang} onGoToCustomer={goToCustomer} />
        )}
        {screen === "orders" && (
          <OrdersScreen
            data={data} lang={lang}
            onSave={handleSave} onDelete={handleDelete} showToast={showToast}
            initialOrder={jumpOrder}
            onClearInitial={() => setJumpOrder(null)}
          />
        )}
        {screen === "customers" && (
          <CustomersScreen
            data={data} lang={lang}
            onSave={handleSave} onDelete={handleDelete} showToast={showToast}
            initialCustomer={jumpCustomer}
            onClearInitial={() => setJumpCustomer(null)}
            onGoToOrder={goToOrder}
          />
        )}
        {screen === "expenses" && (
          <ExpensesScreen
            data={data} lang={lang}
            onSave={handleSave} onDelete={handleDelete} showToast={showToast}
          />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 start-0 end-0 max-w-lg mx-auto bg-white border-t border-gray-100 safe-bottom z-40">
        <div className="flex px-2 py-1.5">
          {nav.map(n => (
            <button key={n.id}
              onClick={() => { setScreen(n.id); setJumpCustomer(null); setJumpOrder(null); }}
              className={`nav-btn ${screen === n.id ? "nav-btn-active" : "nav-btn-inactive"}`}>
              <i className={`ti ${n.icon} text-[20px]`} aria-hidden="true" />
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
