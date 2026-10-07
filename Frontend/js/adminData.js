/**
 * GD Palate Admin – Mock Data
 * Provides realistic orders and analytics for the admin dashboard.
 * Replace with FastAPI REST calls when backend is ready.
 */

/* ─── Helpers ─────────────────────────────────────────────── */
function _t(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

/* ─── Mock Orders ─────────────────────────────────────────── */
/**
 * @typedef {'pending'|'accepted'|'preparing'|'ready'|'completed'|'rejected'|'cancelled'} OrderStatus
 */
const MOCK_ORDERS = [
  {
    id: "ORD-001", token: "T47", customerRef: "STU-2341",
    items: [
      { name: "Masala Dosa",  qty: 1, price: 50  },
      { name: "Coffee",       qty: 2, price: 15  },
    ],
    subtotal: 80, gst: 0, total: 80,
    status: "pending", paymentStatus: "paid",
    createdAt: _t(2), note: "",
  },
  {
    id: "ORD-002", token: "T46", customerRef: "STU-1892",
    items: [
      { name: "Chicken Biryani",     qty: 1, price: 120 },
      { name: "Water Bottle (500ml)", qty: 1, price: 15  },
    ],
    subtotal: 135, gst: 0, total: 135,
    status: "pending", paymentStatus: "paid",
    createdAt: _t(4), note: "Less spicy please",
  },
  {
    id: "ORD-003", token: "T45", customerRef: "STU-3301",
    items: [
      { name: "Veg Meals", qty: 2, price: 80 },
    ],
    subtotal: 160, gst: 0, total: 160,
    status: "pending", paymentStatus: "pending",
    createdAt: _t(1), note: "",
  },
  {
    id: "ORD-004", token: "T44", customerRef: "STU-0822",
    items: [
      { name: "Egg Fried Rice", qty: 1, price: 80 },
      { name: "Cold Coffee",    qty: 1, price: 40 },
    ],
    subtotal: 120, gst: 0, total: 120,
    status: "pending", paymentStatus: "paid",
    createdAt: _t(6), note: "",
  },
  {
    id: "ORD-005", token: "T43", customerRef: "STU-2210",
    items: [
      { name: "Pav Bhaji", qty: 1, price: 60 },
      { name: "Lassi",     qty: 1, price: 30 },
    ],
    subtotal: 90, gst: 0, total: 90,
    status: "accepted", paymentStatus: "paid",
    createdAt: _t(8), note: "",
  },
  {
    id: "ORD-006", token: "T42", customerRef: "STU-1104",
    items: [
      { name: "Chicken Biryani", qty: 2, price: 120 },
    ],
    subtotal: 240, gst: 0, total: 240,
    status: "preparing", paymentStatus: "paid",
    createdAt: _t(12), note: "Extra raita",
  },
  {
    id: "ORD-007", token: "T41", customerRef: "STU-3889",
    items: [
      { name: "Idli (2 pcs)", qty: 2, price: 25 },
      { name: "Tea",          qty: 1, price: 10 },
    ],
    subtotal: 60, gst: 0, total: 60,
    status: "preparing", paymentStatus: "paid",
    createdAt: _t(15), note: "",
  },
  {
    id: "ORD-008", token: "T40", customerRef: "STU-0331",
    items: [
      { name: "Veg Sandwich",   qty: 2, price: 35 },
      { name: "Orange Juice",   qty: 1, price: 40 },
    ],
    subtotal: 110, gst: 0, total: 110,
    status: "preparing", paymentStatus: "paid",
    createdAt: _t(10), note: "",
  },
  {
    id: "ORD-009", token: "T39", customerRef: "STU-2001",
    items: [
      { name: "Masala Dosa", qty: 1, price: 50 },
      { name: "Coffee",      qty: 1, price: 15 },
    ],
    subtotal: 65, gst: 0, total: 65,
    status: "ready", paymentStatus: "paid",
    createdAt: _t(18), note: "",
  },
  {
    id: "ORD-010", token: "T38", customerRef: "STU-4412",
    items: [
      { name: "Chicken Frankie", qty: 2, price: 70 },
      { name: "Cold Coffee",     qty: 1, price: 40 },
    ],
    subtotal: 180, gst: 0, total: 180,
    status: "ready", paymentStatus: "paid",
    createdAt: _t(22), note: "Extra chutney",
  },
  {
    id: "ORD-011", token: "T37", customerRef: "STU-1553",
    items: [
      { name: "Non-Veg Meals", qty: 1, price: 110 },
    ],
    subtotal: 110, gst: 0, total: 110,
    status: "completed", paymentStatus: "paid",
    createdAt: _t(35), note: "",
  },
  {
    id: "ORD-012", token: "T36", customerRef: "STU-2240",
    items: [
      { name: "Egg Biryani",  qty: 1, price: 90 },
      { name: "Buttermilk",   qty: 1, price: 20 },
    ],
    subtotal: 110, gst: 0, total: 110,
    status: "completed", paymentStatus: "paid",
    createdAt: _t(42), note: "",
  },
  {
    id: "ORD-013", token: "T35", customerRef: "STU-3301",
    items: [
      { name: "Ghee Roast Dosa", qty: 2, price: 60 },
    ],
    subtotal: 120, gst: 0, total: 120,
    status: "completed", paymentStatus: "paid",
    createdAt: _t(55), note: "",
  },
  {
    id: "ORD-014", token: "T34", customerRef: "STU-0910",
    items: [
      { name: "Tea",      qty: 3, price: 10 },
      { name: "Veg Puff", qty: 3, price: 25 },
    ],
    subtotal: 105, gst: 0, total: 105,
    status: "completed", paymentStatus: "paid",
    createdAt: _t(68), note: "",
  },
  {
    id: "ORD-015", token: "T33", customerRef: "STU-1771",
    items: [
      { name: "Cheese Pav Bhaji",  qty: 1, price: 80 },
      { name: "Watermelon Juice",  qty: 1, price: 35 },
    ],
    subtotal: 115, gst: 0, total: 115,
    status: "completed", paymentStatus: "paid",
    createdAt: _t(75), note: "",
  },
  {
    id: "ORD-016", token: "T32", customerRef: "STU-4012",
    items: [
      { name: "Chicken Biryani", qty: 1, price: 120 },
    ],
    subtotal: 120, gst: 0, total: 120,
    status: "rejected", paymentStatus: "refunded",
    createdAt: _t(90), note: "Out of stock",
  },
  {
    id: "ORD-017", token: "T31", customerRef: "STU-2550",
    items: [
      { name: "Veg Biryani", qty: 1, price: 80 },
      { name: "Raita",       qty: 1, price: 10 },
    ],
    subtotal: 90, gst: 0, total: 90,
    status: "completed", paymentStatus: "paid",
    createdAt: _t(82), note: "",
  },
];

/* ─── Analytics Mock Data ─────────────────────────────────── */
const ANALYTICS_MOCK = {
  today: {
    totalOrders: 47,
    revenue: 5820,
    avgOrderValue: 124,
    chartLabels: ["8 AM","9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM"],
    chartData:   [5, 18, 22, 8, 14, 19, 11, 7, 5, 3, 2],
    topItems: [
      { name: "Coffee",          emoji: "☕", qty: 34, revenue: 510  },
      { name: "Chicken Biryani", emoji: "🍗", qty: 23, revenue: 2760 },
      { name: "Masala Dosa",     emoji: "🫓", qty: 19, revenue: 950  },
      { name: "Veg Meals",       emoji: "🍛", qty: 16, revenue: 1280 },
      { name: "Egg Fried Rice",  emoji: "🍚", qty: 12, revenue: 960  },
      { name: "Cold Coffee",     emoji: "🥤", qty: 11, revenue: 440  },
    ],
  },
  week: {
    totalOrders: 294,
    revenue: 36540,
    avgOrderValue: 124,
    chartLabels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    chartData:   [52, 67, 48, 71, 63, 41, 22],
    topItems: [
      { name: "Coffee",          emoji: "☕", qty: 210, revenue: 3150  },
      { name: "Chicken Biryani", emoji: "🍗", qty: 143, revenue: 17160 },
      { name: "Masala Dosa",     emoji: "🫓", qty: 122, revenue: 6100  },
      { name: "Veg Meals",       emoji: "🍛", qty: 98,  revenue: 7840  },
      { name: "Egg Fried Rice",  emoji: "🍚", qty: 76,  revenue: 6080  },
      { name: "Cold Coffee",     emoji: "🥤", qty: 68,  revenue: 2720  },
    ],
  },
  month: {
    totalOrders: 1147,
    revenue: 143620,
    avgOrderValue: 125,
    chartLabels: ["Week 1","Week 2","Week 3","Week 4"],
    chartData:   [278, 312, 285, 272],
    topItems: [
      { name: "Coffee",          emoji: "☕", qty: 821, revenue: 12315 },
      { name: "Chicken Biryani", emoji: "🍗", qty: 562, revenue: 67440 },
      { name: "Masala Dosa",     emoji: "🫓", qty: 478, revenue: 23900 },
      { name: "Veg Meals",       emoji: "🍛", qty: 384, revenue: 30720 },
      { name: "Egg Fried Rice",  emoji: "🍚", qty: 297, revenue: 23760 },
      { name: "Cold Coffee",     emoji: "🥤", qty: 264, revenue: 10560 },
    ],
  },
};

/* ─── Status config ───────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "#c8862a", bg: "#fdf3e0", dot: "#c8862a" },
  accepted:  { label: "Accepted",  color: "#2563eb", bg: "#eff6ff", dot: "#2563eb" },
  preparing: { label: "Preparing", color: "#7c3aed", bg: "#f5f3ff", dot: "#7c3aed" },
  ready:     { label: "Ready",     color: "#1e4d2b", bg: "#edf7ee", dot: "#1e4d2b" },
  completed: { label: "Completed", color: "#6b6b6b", bg: "#f4f4f4", dot: "#9b9b9b" },
  rejected:  { label: "Rejected",  color: "#c62828", bg: "#fff0f0", dot: "#c62828" },
  cancelled: { label: "Cancelled", color: "#9b9b9b", bg: "#f4f4f4", dot: "#9b9b9b" },
};

/**
 * Returns allowed next actions for a given order status.
 * Each action: { label, newStatus, style }
 */
function getOrderActions(status) {
  switch (status) {
    case "pending":
      return [
        { label: "✓ Accept",  newStatus: "accepted",  style: "btn-action-green"  },
        { label: "✕ Reject",  newStatus: "rejected",  style: "btn-action-red"    },
        { label: "Cancel",    newStatus: "cancelled", style: "btn-action-ghost"  },
      ];
    case "accepted":
      return [
        { label: "Start Preparing", newStatus: "preparing", style: "btn-action-green" },
        { label: "Cancel",          newStatus: "cancelled", style: "btn-action-ghost" },
      ];
    case "preparing":
      return [
        { label: "✓ Mark Ready", newStatus: "ready", style: "btn-action-green" },
      ];
    case "ready":
      return [
        { label: "✓ Complete", newStatus: "completed", style: "btn-action-green" },
      ];
    default:
      return [];
  }
}

/**
 * Maps order status to the kanban column it belongs in.
 */
function getKanbanColumn(status) {
  if (status === "pending")                  return "col-pending";
  if (status === "accepted" || status === "preparing") return "col-preparing";
  if (status === "ready")                    return "col-ready";
  if (status === "completed")                return "col-completed";
  return null;
}
