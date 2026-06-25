export const LANGUAGES = { en: "English", ar: "العربية" };

export const MONTHS = {
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
};

export const EXPENSE_CATS = [
  { key: "productCost",  en: "Product cost",  ar: "تكلفة المنتج" },
  { key: "packaging",    en: "Packaging",      ar: "تغليف"        },
  { key: "advertising",  en: "Advertising",    ar: "إعلانات"      },
  { key: "delivery",     en: "Delivery",       ar: "توصيل"        },
  { key: "other",        en: "Other",          ar: "أخرى"         },
];

export const ORDER_STATUSES = [
  { key: "pending",    en: "Pending",         ar: "معلق"          },
  { key: "confirmed",  en: "Confirmed",       ar: "مؤكد"          },
  { key: "packaged",   en: "Packaged",        ar: "مغلف"          },
  { key: "inDelivery", en: "In delivery",     ar: "قيد التوصيل"   },
  { key: "delivered",  en: "Delivered",       ar: "تم التوصيل"    },
  { key: "cancelled",  en: "Cancelled",       ar: "ملغي"          },
];

export const PAYMENT_METHODS = [
  { key: "cash",     en: "Cash",          ar: "كاش"         },
  { key: "instapay", en: "Instapay",      ar: "انستاباي"    },
  { key: "transfer", en: "Bank transfer", ar: "تحويل بنكي"  },
];

export const DELIVERY_METHODS = [
  { key: "self",    en: "Self delivery", ar: "توصيل شخصي"    },
  { key: "courier", en: "Courier",       ar: "شركة توصيل"    },
];

// Helper: get label in current language
export const label = (arr, key, lang) =>
  arr.find(i => i.key === key)?.[lang] || key;

export const tr = {
  en: {
    appName: "Tahini",
    // Nav
    dashboard: "Dashboard", orders: "Orders", customers: "Customers", expenses: "Expenses",
    // Dashboard
    todaySales: "Today's sales", monthRevenue: "Month revenue",
    newCustomers: "New customers", returning: "Returning",
    avgOrder: "Avg order", totalExpenses: "Expenses",
    monthlyProfit: "Monthly profit", margin: "margin",
    costs: "Costs", revenue: "Revenue",
    exportReport: "Export monthly report",
    exportDesc: "4 sheets: orders, expenses, customers, profit summary",
    export: "Export",
    followUp: "Follow up",
    toPackToday: "To pack", inDelivery: "In delivery",
    unpaidOrders: "Unpaid orders", collected: "Collected", outstanding: "Outstanding",
    // Orders
    newOrder: "New order", allOrders: "All orders", orderHistory: "Order history",
    editOrder: "Edit order", orderDeleted: "Order deleted",
    orderSaved: "Order saved ✓", orderUpdated: "Order updated ✓",
    // Order fields
    customer: "Customer", searchCustomer: "Search by name or phone…",
    newCustomerSection: "New customer details",
    date: "Date", products: "Products & quantities",
    total: "Total (EGP)", deliveryFee: "Delivery fee (EGP)",
    status: "Status", notes: "Notes", optional: "Optional",
    deliveryMethod: "Delivery method",
    courierName: "Courier name", trackingNo: "Tracking # (optional)",
    paymentStatus: "Payment", paymentMethod: "Method",
    // Customers
    newCustomerBtn: "New customer", allCustomers: "All customers",
    customerSaved: "Customer saved ✓", customerUpdated: "Customer updated ✓",
    customerDeleted: "Customer deleted",
    name: "Name", phone: "Phone", area: "Area",
    memberSince: "Customer since", totalSpent: "Total spent",
    lastOrder: "Last order", ordersCount: "Orders",
    newBadge: "new", returningBadge: "returning",
    edit: "Edit", delete: "Delete", back: "Back",
    // Expenses
    logExpense: "Log expense", allExpenses: "All expenses",
    expenseSaved: "Expense saved ✓", expenseUpdated: "Expense updated ✓",
    expenseDeleted: "Expense deleted",
    thisMonth: "This month", largestItem: "Largest item",
    amount: "Amount (EGP)", category: "Category",
    // Misc
    save: "Save", cancel: "Cancel", noData: "Nothing here yet",
    daysAgo: "days ago", needsFollowUp: "needs follow-up",
    confirmDelete: "Delete this record?", yes: "Delete", no: "Cancel",
    namePh: "Full name", phonePh: "010…", areaPh: "Maadi, Dokki…",
    productsPh: "2× Tahini 500g, 1× Tahini 1kg", courierPh: "Bosta, Aramex…",
    paid: "Paid", unpaid: "Unpaid",
    offline: "Offline — changes will sync when connected",
    syncing: "Syncing…", synced: "All changes saved ✓",
    selectExisting: "Select existing customer",
    orAddNew: "Or fill in new customer details below",
  },
  ar: {
    appName: "طحينة",
    // Nav
    dashboard: "الرئيسية", orders: "الطلبات", customers: "العملاء", expenses: "المصاريف",
    // Dashboard
    todaySales: "مبيعات اليوم", monthRevenue: "مبيعات الشهر",
    newCustomers: "عملاء جدد", returning: "عملاء عائدين",
    avgOrder: "متوسط الطلب", totalExpenses: "المصاريف",
    monthlyProfit: "ربح الشهر", margin: "هامش",
    costs: "التكاليف", revenue: "الإيرادات",
    exportReport: "تصدير تقرير شهري",
    exportDesc: "4 صفحات: طلبات، مصاريف، عملاء، ملخص الأرباح",
    export: "تصدير",
    followUp: "يحتاج متابعة",
    toPackToday: "للتغليف", inDelivery: "قيد التوصيل",
    unpaidOrders: "طلبات غير مدفوعة", collected: "تم التحصيل", outstanding: "متبقي",
    // Orders
    newOrder: "طلب جديد", allOrders: "كل الطلبات", orderHistory: "سجل الطلبات",
    editOrder: "تعديل الطلب", orderDeleted: "تم حذف الطلب",
    orderSaved: "تم حفظ الطلب ✓", orderUpdated: "تم تحديث الطلب ✓",
    // Order fields
    customer: "العميل", searchCustomer: "ابحث بالاسم أو رقم الهاتف…",
    newCustomerSection: "بيانات العميل الجديد",
    date: "التاريخ", products: "المنتجات والكميات",
    total: "الإجمالي (ج.م)", deliveryFee: "رسوم التوصيل (ج.م)",
    status: "الحالة", notes: "ملاحظات", optional: "اختياري",
    deliveryMethod: "طريقة التوصيل",
    courierName: "اسم شركة التوصيل", trackingNo: "رقم التتبع (اختياري)",
    paymentStatus: "الدفع", paymentMethod: "طريقة الدفع",
    // Customers
    newCustomerBtn: "عميل جديد", allCustomers: "كل العملاء",
    customerSaved: "تم حفظ العميل ✓", customerUpdated: "تم تحديث العميل ✓",
    customerDeleted: "تم حذف العميل",
    name: "الاسم", phone: "رقم الهاتف", area: "المنطقة",
    memberSince: "عميل منذ", totalSpent: "إجمالي المشتريات",
    lastOrder: "آخر طلب", ordersCount: "الطلبات",
    newBadge: "جديد", returningBadge: "عائد",
    edit: "تعديل", delete: "حذف", back: "رجوع",
    // Expenses
    logExpense: "تسجيل مصروف", allExpenses: "كل المصاريف",
    expenseSaved: "تم حفظ المصروف ✓", expenseUpdated: "تم تحديث المصروف ✓",
    expenseDeleted: "تم حذف المصروف",
    thisMonth: "هذا الشهر", largestItem: "أكبر بند",
    amount: "المبلغ (ج.م)", category: "الفئة",
    // Misc
    save: "حفظ", cancel: "إلغاء", noData: "لا يوجد بيانات بعد",
    daysAgo: "أيام", needsFollowUp: "يحتاج متابعة",
    confirmDelete: "حذف هذا السجل؟", yes: "نعم، احذف", no: "إلغاء",
    namePh: "الاسم الكامل", phonePh: "010…", areaPh: "المعادي، الدقي…",
    productsPh: "2× طحينة 500 جرام", courierPh: "بوسطة، أراميكس…",
    paid: "مدفوع", unpaid: "غير مدفوع",
    offline: "غير متصل — ستُزامن التغييرات عند الاتصال",
    syncing: "جاري المزامنة…", synced: "تم الحفظ ✓",
    selectExisting: "اختر عميل موجود",
    orAddNew: "أو أضف بيانات عميل جديد أدناه",
  },
};
