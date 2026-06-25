import { createClient } from "@supabase/supabase-js";

// ── Supabase client ───────────────────────────────────────────────────────────
const URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const supabase = URL ? createClient(URL, KEY) : null;

// ── Local cache keys ──────────────────────────────────────────────────────────
const CACHE_KEY   = "tahini_cache_v2";
const PENDING_KEY = "tahini_pending_v2";

// ── Cache helpers ─────────────────────────────────────────────────────────────
export const EMPTY_DATA = { customers: [], orders: [], expenses: [] };

export function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || EMPTY_DATA; }
  catch { return EMPTY_DATA; }
}
export function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

function readPending() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; }
  catch { return []; }
}
function writePending(ops) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(ops)); } catch {}
}
function queueOp(op) {
  const ops = readPending();
  // Replace any previous op on the same id to avoid duplicates
  const filtered = ops.filter(o => !(o.table === op.table && o.id === op.id));
  filtered.push({ ...op, ts: Date.now() });
  writePending(filtered);
}

// ── Sync pending offline ops to Supabase ──────────────────────────────────────
export async function syncPending() {
  if (!supabase) return;
  const ops = readPending();
  if (!ops.length) return;
  const failed = [];
  for (const op of ops) {
    try {
      if (op.type === "upsert") {
        const { error } = await supabase.from(op.table).upsert(op.data);
        if (error) throw error;
      } else if (op.type === "delete") {
        const { error } = await supabase.from(op.table).delete().eq("id", op.id);
        if (error) throw error;
      }
    } catch { failed.push(op); }
  }
  writePending(failed);
  return failed.length === 0;
}

// ── Fetch all data (online first, cache fallback) ─────────────────────────────
export async function fetchAll() {
  if (!supabase) {
    // Demo mode — use cache only (no Supabase configured yet)
    const cache = readCache();
    if (!cache.customers.length && !cache.orders.length) {
      // Seed with sample data so the app isn't empty on first run
      const demo = getDemoData();
      writeCache(demo);
      return { data: demo, online: false, demo: true };
    }
    return { data: cache, online: false };
  }
  try {
    await syncPending();
    const [c, o, e] = await Promise.all([
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("date", { ascending: false }),
      supabase.from("expenses").select("*").order("date", { ascending: false }),
    ]);
    const data = {
      customers: c.data || [],
      orders:    o.data || [],
      expenses:  e.data || [],
    };
    writeCache(data);
    return { data, online: true };
  } catch {
    return { data: readCache(), online: false };
  }
}

// ── Write helpers (optimistic: update cache immediately, sync to cloud) ───────
export async function upsertRow(table, row, currentData, setData) {
  // 1. Update local state immediately
  const key = table;
  const existing = currentData[key].findIndex(r => r.id === row.id);
  const next = [...currentData[key]];
  if (existing >= 0) next[existing] = row; else next.unshift(row);
  const updated = { ...currentData, [key]: next };
  setData(updated);
  writeCache(updated);

  // 2. Persist to Supabase (or queue for later)
  if (supabase) {
    try {
      const { error } = await supabase.from(table).upsert(row);
      if (error) throw error;
    } catch { queueOp({ type: "upsert", table, id: row.id, data: row }); }
  } else {
    queueOp({ type: "upsert", table, id: row.id, data: row });
  }
}

export async function deleteRow(table, id, currentData, setData) {
  // 1. Remove from local state immediately
  const updated = { ...currentData, [table]: currentData[table].filter(r => r.id !== id) };
  setData(updated);
  writeCache(updated);

  // 2. Persist to Supabase (or queue)
  if (supabase) {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    } catch { queueOp({ type: "delete", table, id }); }
  } else {
    queueOp({ type: "delete", table, id });
  }
}

// ── Demo / sample data ────────────────────────────────────────────────────────
function getDemoData() {
  const today = new Date().toISOString().slice(0, 10);
  const d = (daysAgo) => {
    const dt = new Date(); dt.setDate(dt.getDate() - daysAgo);
    return dt.toISOString().slice(0, 10);
  };
  return {
    customers: [
      { id: "c1", name: "سارة محمد",  phone: "01012345678", area: "المعادي",      created_at: d(45) },
      { id: "c2", name: "أحمد كمال",  phone: "01022334455", area: "مصر الجديدة", created_at: d(40) },
      { id: "c3", name: "نور حسن",    phone: "01555544333", area: "الدقي",        created_at: d(35) },
      { id: "c4", name: "محمود علي",  phone: "01198765432", area: "مدينة نصر",   created_at: d(1)  },
    ],
    orders: [
      { id: "o1", customer_id:"c1", date:today,  products:"2× طحينة 500 جرام",  total:430, delivery_fee:30, delivery_method:"courier", courier_name:"بوسطة", tracking_number:"BST123", status:"delivered",  payment_status:"paid",   payment_method:"instapay", notes:"" },
      { id: "o2", customer_id:"c4", date:d(1),   products:"1× طحينة 1 كيلو",    total:420, delivery_fee:30, delivery_method:"self",    courier_name:"",      tracking_number:"",       status:"pending",    payment_status:"unpaid", payment_method:"cash",     notes:"يريد التوصيل الساعة 6" },
      { id: "o3", customer_id:"c3", date:d(3),   products:"3× طحينة 500 جرام",  total:645, delivery_fee:30, delivery_method:"courier", courier_name:"بوسطة", tracking_number:"BST124", status:"inDelivery", payment_status:"unpaid", payment_method:"cash",     notes:"" },
      { id: "o4", customer_id:"c2", date:d(5),   products:"2× طحينة 500 جرام",  total:430, delivery_fee:25, delivery_method:"self",    courier_name:"",      tracking_number:"",       status:"packaged",   payment_status:"paid",   payment_method:"transfer", notes:"" },
      { id: "o5", customer_id:"c1", date:d(14),  products:"2× طحينة 1 كيلو",    total:840, delivery_fee:30, delivery_method:"courier", courier_name:"أراميكس",tracking_number:"",      status:"delivered",  payment_status:"paid",   payment_method:"cash",     notes:"" },
      { id: "o6", customer_id:"c3", date:d(18),  products:"1× طحينة 500 جرام",  total:215, delivery_fee:25, delivery_method:"self",    courier_name:"",      tracking_number:"",       status:"delivered",  payment_status:"paid",   payment_method:"instapay", notes:"" },
      { id: "o7", customer_id:"c2", date:d(22),  products:"1× طحينة 1 كيلو",    total:420, delivery_fee:30, delivery_method:"courier", courier_name:"بوسطة", tracking_number:"BST100", status:"delivered",  payment_status:"paid",   payment_method:"cash",     notes:"" },
    ],
    expenses: [
      { id: "e1", date:d(4),  category:"productCost", amount:7200, notes:"دفعة شراء منتجات"     },
      { id: "e2", date:d(9),  category:"packaging",   amount:400,  notes:"ستيكرات وأكياس"        },
      { id: "e3", date:d(14), category:"advertising", amount:900,  notes:"إعلانات فيسبوك"        },
      { id: "e4", date:d(10), category:"delivery",    amount:400,  notes:"رسوم بوسطة"            },
    ],
  };
}
