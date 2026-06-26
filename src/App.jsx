import { useState, useEffect, useCallback } from "react";
import { tr } from "./i18n";
import { fetchAll, upsertRow, deleteRow, EMPTY_DATA } from "./db";
import { Toast, OfflineBanner } from "./components/ui";
import Dashboard      from "./components/Dashboard";
import OrdersScreen   from "./components/Orders";
import CustomersScreen from "./components/Customers";
import ExpensesScreen  from "./components/Expenses";

const LANG_KEY  = "tahini_lang";
const THEME_KEY = "tahini_theme";

export default function App() {
  const [lang,  setLang]  = useState(() => localStorage.getItem(LANG_KEY)  || "ar");
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [data,    setData]    = useState(EMPTY_DATA);
  const [online,  setOnline]  = useState(true);
  const [loading, setLoading] = useState(true);
  const [screen,  setScreen]  = useState("dashboard");
  const [toast,   setToast]   = useState(null);
  const [jumpCustomer, setJumpCustomer] = useState(null);
  const [jumpOrder,    setJumpOrder]    = useState(null);

  const t      = tr[lang];
  const isRTL  = lang === "ar";
  const isDark = theme === "dark";

  // Apply RTL to document
  useEffect(() => {
    document.documentElement.dir  = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang, isRTL]);

  // Apply dark mode class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else        root.classList.remove("dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, isDark]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

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
    const goOnline  = () => { setOnline(true); fetchAll().then(({ data: d }) => setData(d)); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const showToast = msg => setToast(msg);

  // ── Save handler ──────────────────────────────────────────────────────────
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

  // ── Nav items — filled icon when active, outline when inactive ───────────
  const nav = [
    { id: "dashboard", iconActive: "ti-chart-bar-popular", iconInactive: "ti-chart-bar",    label: t.dashboard },
    { id: "orders",    iconActive: "ti-shopping-cart",      iconInactive: "ti-shopping-cart", label: t.orders    },
    { id: "customers", iconActive: "ti-users-group",        iconInactive: "ti-users",         label: t.customers },
    { id: "expenses",  iconActive: "ti-receipt",            iconInactive: "ti-receipt",       label: t.expenses  },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center gap-3 text-gray-400">
        <i className="ti ti-loader-2 text-4xl animate-spin text-brand" aria-hidden="true" />
        <p className="text-sm">{isRTL ? "جاري التحميل…" : "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col max-w-lg mx-auto relative">

      {/* Top bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 safe-top flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t.appName}</h1>

        <div className="flex items-center gap-2">
          {/* Offline dot */}
          {!online && <span className="w-2 h-2 rounded-full bg-amber-400" title="Offline" />}

          {/* Dark / Light toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <i className={`ti ${isDark ? "ti-sun" : "ti-moon"} text-base`} aria-hidden="true" />
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
            className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
      <nav className="fixed bottom-0 start-0 end-0 max-w-lg mx-auto bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 safe-bottom z-40">
        <div className="flex px-2 py-1.5">
          {nav.map(n => {
            const isActive = screen === n.id;
            return (
              <button key={n.id}
                onClick={() => { setScreen(n.id); setJumpCustomer(null); setJumpOrder(null); }}
                className={`nav-btn ${isActive ? "nav-btn-active" : "nav-btn-inactive"}`}>
                <i
                  className={`ti ${isActive ? n.iconActive : n.iconInactive} text-[22px]`}
                  aria-hidden="true"
                />
                <span className="text-[10px] mt-0.5">{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}