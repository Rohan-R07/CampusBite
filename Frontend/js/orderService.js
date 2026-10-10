/**
 * GD Palate – Shared Order Service
 * Frontend mock service layer for managing orders between Student and Staff/Admin.
 * Uses localStorage to synchronize real-time order state across tabs/views.
 */

const OrderService = (() => {
  const STORAGE_KEY = 'gd_palate_shared_orders';
  const TOKEN_KEY = 'gd_palate_token_counter';
  const listeners = new Set();

  // Initial seed orders if storage is empty
  const SEED_ORDERS = [
    {
      id: "ORD-1001",
      token: "#T47",
      customerRef: "STU-2024",
      items: [
        { id: "d002", name: "Masala Dosa", qty: 1, price: 50 },
        { id: "bv002", name: "Coffee", qty: 2, price: 15 }
      ],
      subtotal: 80,
      total: 80,
      paymentStatus: "paid",
      paymentMethod: "UPI / GPay",
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      note: "Less spicy please",
      pickupLocation: "GD Palate Counter 1",
      estimatedPrepMins: 15
    },
    {
      id: "ORD-1002",
      token: "#T46",
      customerRef: "STU-1892",
      items: [
        { id: "br001", name: "Chicken Biryani", qty: 1, price: 120 },
        { id: "w001", name: "Water Bottle (500ml)", qty: 1, price: 15 }
      ],
      subtotal: 135,
      total: 135,
      paymentStatus: "paid",
      paymentMethod: "Campus Card",
      status: "preparing",
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      note: "",
      pickupLocation: "GD Palate Counter 1",
      estimatedPrepMins: 15
    },
    {
      id: "ORD-1003",
      token: "#T45",
      customerRef: "STU-3301",
      items: [
        { id: "m001", name: "Veg Meals", qty: 1, price: 80 },
        { id: "j001", name: "Orange Juice", qty: 1, price: 40 }
      ],
      subtotal: 120,
      total: 120,
      paymentStatus: "paid",
      paymentMethod: "UPI / GPay",
      status: "ready",
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      note: "",
      pickupLocation: "GD Palate Counter 1",
      estimatedPrepMins: 15
    }
  ];

  function _loadOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error("OrderService load error:", e);
    }
    // Default seed
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
    return [...SEED_ORDERS];
  }

  function _saveOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("OrderService save error:", e);
    }
    _notify();
  }

  function _getNextToken() {
    let num = 48;
    try {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (saved) num = parseInt(saved, 10);
    } catch (e) {}
    localStorage.setItem(TOKEN_KEY, (num + 1).toString());
    return `#T${num}`;
  }

  function _notify() {
    const orders = _loadOrders();
    listeners.forEach(fn => {
      try { fn(orders); } catch (e) { console.error(e); }
    });
  }

  // Listen for storage events from other browser tabs (Student <-> Admin sync)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      _notify();
    }
  });

  return {
    /** Get all shared orders */
    getOrders() {
      return _loadOrders();
    },

    /** Get orders for a specific student */
    getStudentOrders(studentId = "STU-2024") {
      const orders = _loadOrders();
      return orders.filter(o => o.customerRef === studentId || o.customerRef === "STU-2024");
    },

    /** Get single order by ID or Token */
    getOrderById(idOrToken) {
      const orders = _loadOrders();
      return orders.find(o => o.id === idOrToken || o.token === idOrToken);
    },

    /** Create a new student order */
    createOrder({ items, total, subtotal, paymentMethod, note, customerId = "STU-2024" }) {
      const token = _getNextToken();
      const id = "ORD-" + Date.now();
      const newOrder = {
        id,
        token,
        customerRef: customerId,
        items: items.map(e => ({
          id: e.item.id,
          name: e.item.name,
          qty: e.qty,
          price: e.item.price,
          emoji: e.item.emoji || '🍽️'
        })),
        subtotal: subtotal || total,
        total,
        paymentStatus: "paid",
        paymentMethod: paymentMethod || "UPI / GPay",
        status: "pending",
        createdAt: new Date().toISOString(),
        note: note || "",
        pickupLocation: "GD Palate Counter 1",
        estimatedPrepMins: 15
      };

      const orders = _loadOrders();
      orders.unshift(newOrder);
      _saveOrders(orders);
      return newOrder;
    },

    /** Update status of an existing order (used by Staff Admin) */
    updateOrderStatus(orderId, newStatus) {
      const orders = _loadOrders();
      const order = orders.find(o => o.id === orderId || o.token === orderId);
      if (!order) return null;

      order.status = newStatus;
      _saveOrders(orders);
      return order;
    },

    /** Subscribe to real-time order updates */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
})();
