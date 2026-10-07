/**
 * GD Palate – Cart Store
 * Central cart state with authoritative MAX 8 total items order limit.
 */

const MAX_CART_ITEMS = 8;

const Cart = (() => {
  /** @type {Map<string, {item: MenuItem, qty: number}>} */
  const _store = new Map();
  const _listeners = new Set();

  function _notify() {
    const summary = Cart.getSummary();
    _listeners.forEach(fn => fn(summary));
  }

  return {
    MAX_ITEMS: MAX_CART_ITEMS,

    /** Subscribe to cart changes. Returns unsubscribe fn. */
    subscribe(fn) {
      _listeners.add(fn);
      return () => _listeners.delete(fn);
    },

    /** Add one unit of item, strictly capped at MAX_CART_ITEMS (8 total items). */
    addItem(item) {
      if (Cart.totalCount >= MAX_CART_ITEMS) {
        if (typeof showToast === 'function') {
          showToast("⚠️ Order limit reached (8 items max)");
        }
        return false;
      }
      if (_store.has(item.id)) {
        _store.get(item.id).qty++;
      } else {
        _store.set(item.id, { item, qty: 1 });
      }
      _notify();
      return true;
    },

    /** Remove one unit. Removes entry if qty hits 0. */
    removeItem(itemId) {
      if (!_store.has(itemId)) return;
      const entry = _store.get(itemId);
      if (entry.qty > 1) {
        entry.qty--;
      } else {
        _store.delete(itemId);
      }
      _notify();
    },

    /** Set exact quantity respecting MAX_CART_ITEMS limit across all items. */
    setQty(itemId, qty) {
      if (qty <= 0) {
        _store.delete(itemId);
      } else {
        const currentItemQty = Cart.getQty(itemId);
        const countWithoutItem = Cart.totalCount - currentItemQty;
        if (countWithoutItem + qty > MAX_CART_ITEMS) {
          const maxAllowed = MAX_CART_ITEMS - countWithoutItem;
          if (maxAllowed > 0 && _store.has(itemId)) {
            _store.get(itemId).qty = maxAllowed;
          }
          if (typeof showToast === 'function') {
            showToast("⚠️ Order limit reached (8 items max)");
          }
        } else {
          if (_store.has(itemId)) {
            _store.get(itemId).qty = qty;
          }
        }
      }
      _notify();
    },

    /** Get quantity of a specific item. */
    getQty(itemId) {
      return _store.get(itemId)?.qty || 0;
    },

    /** Get all cart entries as array. */
    getEntries() {
      return Array.from(_store.values());
    },

    /** Total number of individual item quantities across all items. */
    get totalCount() {
      let n = 0;
      _store.forEach(e => (n += e.qty));
      return n;
    },

    /** Subtotal price. */
    get subtotal() {
      let t = 0;
      _store.forEach(e => (t += e.item.price * e.qty));
      return t;
    },

    /** Clear entire cart. */
    clear() {
      _store.clear();
      _notify();
    },

    /** Summary object. */
    getSummary() {
      return {
        entries: Cart.getEntries(),
        totalCount: Cart.totalCount,
        subtotal: Cart.subtotal,
      };
    },
  };
})();
