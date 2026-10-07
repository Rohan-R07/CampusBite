/**
 * GD Palate – Main Application
 * Phase 3: Connected Student ↔ Staff Canteen Order Flow
 * Handles routing, menu filtering, order limits, continuous leaf animation,
 * checkout, mock payment, confirmation, live order tracking, and order history.
 */

/* ═══════════════════════════════════════════════════════════
   CATEGORY GRADIENT BACKGROUNDS
   ═══════════════════════════════════════════════════════════ */
const CATEGORY_GRADIENTS = {
  breakfast: ['#fff4e6', '#ffddb5'],
  dosa: ['#fffbea', '#ffedb0'],
  chinese: ['#fff0f0', '#ffd6d6'],
  meals: ['#eef7ee', '#c5e6c7'],
  'south-indian': ['#fff6e0', '#ffdea0'],
  egg: ['#fffde8', '#fff3a0'],
  biryani: ['#fdf3e0', '#f5dba0'],
  bakery: ['#f7f0e8', '#eed8b0'],
  beverages: ['#f4ede8', '#d6beb0'],
  'fresh-juice': ['#e8f8ea', '#a8e0b0'],
  sandwich: ['#fff8e8', '#fde8a0'],
  'pav-bhaji': ['#fff0ea', '#ffc8a8'],
  'ice-cream': ['#f5eeff', '#e0c8f8'],
  water: ['#eaf4ff', '#b8d8f8'],
  added: ['#f0f8ec', '#d0e8c0'],
};

/** Build the gradient style string for a menu item. */
function itemGradient(item) {
  const [c1, c2] = CATEGORY_GRADIENTS[item.category] || ['#f4f0e8', '#e8dcc8'];
  return `background: linear-gradient(135deg, ${c1}, ${c2})`;
}


/* ═══════════════════════════════════════════════════════════
   CONTINUOUS LEAF ANIMATION (STUDENT HOME ONLY)
   ═══════════════════════════════════════════════════════════ */
const LeafAnimation = (() => {
  let animId = null;
  let isRunning = false;
  let leaves = [];
  const LEAF_COUNT = 7;
  const LEAF_EMOJIS = ["🍃", "🌿", "🍂"];

  function resetLeaf(leaf, canvasH) {
    const W = window.innerWidth;
    leaf.x = Math.random() * W;
    leaf.y = -20 - Math.random() * 40;
    leaf.size = 14 + Math.random() * 16;
    leaf.speedY = 0.6 + Math.random() * 0.7;
    leaf.drift = (Math.random() - 0.5) * 0.4;
    leaf.rot = Math.random() * Math.PI * 2;
    leaf.rotSpeed = (Math.random() - 0.5) * 0.015;
    leaf.emoji = LEAF_EMOJIS[Math.floor(Math.random() * LEAF_EMOJIS.length)];
    leaf.maxOpacity = 0.35 + Math.random() * 0.3;
    leaf.alpha = 0;
  }

  function start() {
    if (isRunning) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.getElementById("leaf-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "0";
    canvas.style.display = "block";

    leaves = Array.from({ length: LEAF_COUNT }, () => {
      const leaf = {};
      resetLeaf(leaf, H);
      leaf.y = Math.random() * H;
      leaf.alpha = leaf.maxOpacity;
      return leaf;
    });

    isRunning = true;

    function resizeHandler() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeHandler);

    function tick() {
      if (!isRunning) return;

      ctx.clearRect(0, 0, W, H);

      leaves.forEach(leaf => {
        leaf.y += leaf.speedY;
        leaf.x += leaf.drift;
        leaf.rot += leaf.rotSpeed;

        if (leaf.y < 80) {
          leaf.alpha = Math.min(leaf.maxOpacity, ((leaf.y + 20) / 100) * leaf.maxOpacity);
        } else if (leaf.y > H - 100) {
          leaf.alpha = Math.max(0, ((H - leaf.y) / 100) * leaf.maxOpacity);
        } else {
          leaf.alpha = leaf.maxOpacity;
        }

        if (leaf.y > H + 30 || leaf.x < -30 || leaf.x > W + 30) {
          resetLeaf(leaf, H);
        }

        if (leaf.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = leaf.alpha;
          ctx.translate(leaf.x, leaf.y);
          ctx.rotate(leaf.rot);
          ctx.font = `${leaf.size}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(leaf.emoji, 0, 0);
          ctx.restore();
        }
      });

      animId = requestAnimationFrame(tick);
    }

    tick();
  }

  function stop() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    const canvas = document.getElementById("leaf-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
    }
  }

  return { start, stop };
})();


/* ═══════════════════════════════════════════════════════════
   ROUTER & PAGE INITIALIZATION
   ═══════════════════════════════════════════════════════════ */
const Router = (() => {
  let _current = "home";

  const pages = {
    home: document.getElementById("page-home"),
    menu: document.getElementById("page-menu"),
    orders: document.getElementById("page-orders"),
    rewards: document.getElementById("page-rewards"),
  };

  const navLinks = document.querySelectorAll("[data-page]");

  function go(page) {
    if (!pages[page]) return;
    _current = page;

    Object.values(pages).forEach(p => p?.classList.remove("active"));
    pages[page].classList.add("active");

    navLinks.forEach(link => {
      link.classList.toggle("active", link.dataset.page === page);
    });

    if (page === "home") {
      LeafAnimation.start();
    } else {
      LeafAnimation.stop();
    }

    if (page === "menu") renderMenuPage();
    if (page === "orders") renderOrdersPage();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      go(link.dataset.page);
      closeMobileMenu();
    });
  });

  return { go, current: () => _current };
})();


/* ═══════════════════════════════════════════════════════════
   NAVBAR & MOBILE DRAWER
   ═══════════════════════════════════════════════════════════ */
const hamburger = document.getElementById("hamburger");
const mobileDrawer = document.getElementById("mobile-drawer");

function closeMobileMenu() {
  if (hamburger) hamburger.classList.remove("open");
  if (mobileDrawer) mobileDrawer.classList.remove("open");
}

if (hamburger) {
  hamburger.addEventListener("click", () => {
    const isOpen = hamburger.classList.toggle("open");
    mobileDrawer.classList.toggle("open", isOpen);
  });
}

document.addEventListener("click", e => {
  if (hamburger && mobileDrawer && !hamburger.contains(e.target) && !mobileDrawer.contains(e.target)) {
    closeMobileMenu();
  }
});

// Bind all links with data-goto-menu attribute
document.querySelectorAll("[data-goto-menu]").forEach(btn => {
  btn.addEventListener("click", () => Router.go("menu"));
});


/* ═══════════════════════════════════════════════════════════
   CART & ORDER LIMIT (STRICT MAX 8 ITEMS)
   ═══════════════════════════════════════════════════════════ */
const cartBadge = document.getElementById("cart-badge");
const cartOverlay = document.getElementById("cart-overlay");
const cartPanel = cartOverlay ? cartOverlay.querySelector(".cart-panel") : null;
const cartBody = document.getElementById("cart-body");
const cartFooter = document.getElementById("cart-footer");
const cartBtn = document.getElementById("cart-btn");

if (cartBtn) cartBtn.addEventListener("click", openCart);
if (cartOverlay) {
  cartOverlay.addEventListener("click", e => {
    if (cartPanel && !cartPanel.contains(e.target)) closeCart();
  });
}
const cartCloseBtn = document.getElementById("cart-close");
if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCart);

function openCart() {
  if (cartOverlay) cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
  renderCartPanel();
}

function closeCart() {
  if (cartOverlay) cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

Cart.subscribe(({ totalCount }) => {
  if (totalCount > 0) {
    if (cartBadge) {
      cartBadge.textContent = totalCount > 99 ? "99+" : totalCount;
      cartBadge.style.display = "flex";
      cartBadge.classList.add("bump");
      setTimeout(() => cartBadge.classList.remove("bump"), 350);
    }
  } else {
    if (cartBadge) cartBadge.style.display = "none";
  }
  if (cartOverlay && cartOverlay.classList.contains("open")) renderCartPanel();
  updateAllCardSteppers();
});

function renderCartPanel() {
  const { entries, subtotal, totalCount } = Cart.getSummary();

  if (entries.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p style="font-weight:600; color:var(--color-text)">Your cart is empty</p>
        <p style="font-size:0.82rem">Browse the menu and add something delicious</p>
      </div>`;
    cartFooter.innerHTML = "";
    return;
  }

  const isLimitReached = totalCount >= 8;
  const limitBanner = isLimitReached
    ? `<div class="cart-limit-banner limit-reached">⚠️ 8 / 8 items • Order limit reached</div>`
    : `<div class="cart-limit-banner">Order limit: 8 items (${totalCount}/8)</div>`;

  cartBody.innerHTML = limitBanner + entries.map(({ item, qty }) => `
    <div class="cart-item">
      <div class="cart-item__emoji">${item.emoji}</div>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">₹${item.price} × ${qty} = ₹${item.price * qty}</div>
      </div>
      <div class="cart-item__stepper">
        <button onclick="Cart.removeItem('${item.id}')" aria-label="Decrease">−</button>
        <span class="cart-item__qty">${qty}</span>
        <button ${isLimitReached ? 'disabled style="opacity:0.4; cursor:not-allowed"' : ''} 
                onclick="Cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                aria-label="Increase">+</button>
      </div>
    </div>
  `).join("");

  const total = subtotal; // Total equals actual item subtotal

  cartFooter.innerHTML = `
    <div class="cart-pickup-row">
      🕐 Estimated pickup: <strong>11:05 AM</strong>
    </div>
    <div class="cart-summary-row total"><span>Total</span><span>₹${total}</span></div>
    <button class="cart-checkout-btn" onclick="openCheckoutModal()">Continue to Checkout →</button>
  `;
}


/* ═══════════════════════════════════════════════════════════
   PART 3 — STUDENT CHECKOUT & PAYMENT MODAL
   ═══════════════════════════════════════════════════════════ */
function openCheckoutModal() {
  closeCart();
  const summary = Cart.getSummary();
  if (summary.entries.length === 0) return;

  const modal = document.getElementById("checkout-modal");
  const body = document.getElementById("checkout-modal-body");
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="margin-bottom:18px">
      <h4 style="font-family:var(--font-heading); margin-bottom:10px; color:var(--color-primary)">Order Items (${summary.totalCount})</h4>
      <div style="background:var(--color-bg,#faf8f3); border-radius:10px; padding:12px 16px; font-size:0.88rem; max-height:160px; overflow-y:auto">
        ${summary.entries.map(e => `
          <div style="display:flex; justify-content:space-between; margin-bottom:6px">
            <span>${e.item.emoji} ${e.item.name} <strong style="color:var(--color-primary)">x${e.qty}</strong></span>
            <strong>₹${e.item.price * e.qty}</strong>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="margin-bottom:18px; font-size:0.88rem">
      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eaf0e4">
        <span>Subtotal</span>
        <span>₹${summary.subtotal}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:10px 0; font-size:1.1rem; font-weight:800; color:var(--color-primary)">
        <span>Total Amount</span>
        <span>₹${summary.subtotal}</span>
      </div>
    </div>

    <div style="margin-bottom:18px">
      <div style="font-size:0.8rem; text-transform:uppercase; font-weight:700; color:#6b6b6b; margin-bottom:8px">Pickup Location</div>
      <div style="background:#edf7ee; color:#1e4d2b; padding:10px 14px; border-radius:8px; font-weight:600; font-size:0.88rem; display:flex; align-items:center; gap:8px">
        📍 <span>GD Palate Main Counter (Counter 1)</span>
      </div>
    </div>

    <div style="margin-bottom:24px">
      <div style="font-size:0.8rem; text-transform:uppercase; font-weight:700; color:#6b6b6b; margin-bottom:8px">Select Payment Method (Mock)</div>
      <div style="display:flex; flex-direction:column; gap:8px">
        <label style="display:flex; align-items:center; gap:10px; padding:10px 14px; border:1px solid var(--color-border); border-radius:8px; cursor:pointer; font-size:0.88rem">
          <input type="radio" name="pay-method" value="UPI / GPay" checked />
          <span>📱 UPI / GPay / PhonePe</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; padding:10px 14px; border:1px solid var(--color-border); border-radius:8px; cursor:pointer; font-size:0.88rem">
          <input type="radio" name="pay-method" value="Campus Card" />
          <span>💳 Campus Student Card</span>
        </label>
        <label style="display:flex; align-items:center; gap:10px; padding:10px 14px; border:1px solid var(--color-border); border-radius:8px; cursor:pointer; font-size:0.88rem">
          <input type="radio" name="pay-method" value="Cash on Pickup" />
          <span>💵 Cash on Pickup</span>
        </label>
      </div>
    </div>

    <button class="cart-checkout-btn" style="width:100%" onclick="processCheckout()">
      Pay ₹${summary.subtotal} & Place Order →
    </button>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

function processCheckout() {
  const selectedMethod = document.querySelector('input[name="pay-method"]:checked')?.value || "UPI / GPay";
  const summary = Cart.getSummary();
  if (summary.entries.length === 0) return;

  // Create order via shared OrderService
  const createdOrder = OrderService.createOrder({
    items: summary.entries,
    total: summary.subtotal,
    subtotal: summary.subtotal,
    paymentMethod: selectedMethod,
    customerId: "STU-2024"
  });

  // Clear cart & close checkout
  Cart.clear();
  closeCheckoutModal();

  // Show Order Confirmation Modal
  openConfirmationModal(createdOrder);
}


/* ═══════════════════════════════════════════════════════════
   PART 4 & 5 — ORDER CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════ */
function openConfirmationModal(order) {
  const modal = document.getElementById("confirmation-modal");
  const body = document.getElementById("confirmation-modal-body");
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align:center; padding:10px 0">
      <div style="font-size:3.5rem; margin-bottom:8px">✅</div>
      <h2 style="font-family:var(--font-heading); color:var(--color-primary); margin-bottom:4px">Order Confirmed!</h2>
      <p style="font-size:0.85rem; color:#6b6b6b; margin-bottom:20px">Your order has been sent to the GD Palate kitchen.</p>

      <div style="background:var(--color-bg,#faf8f3); padding:16px; border-radius:14px; margin-bottom:20px border:1px solid var(--color-border-light)">
        <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; font-weight:700; color:#6b6b6b">Your Token Number</div>
        <div style="font-size:2.8rem; font-weight:800; color:var(--color-primary); margin:4px 0">${order.token}</div>
        <div style="font-size:0.85rem; color:#1e4d2b; font-weight:600">📍 ${order.pickupLocation}</div>
      </div>

      <div style="text-align:left; font-size:0.88rem; background:#ffffff; border:1px solid #eaf0e4; border-radius:10px; padding:14px; margin-bottom:20px">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px">
          <span>Items Ordered:</span>
          <strong>${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px">
          <span>Total Amount:</span>
          <strong style="color:var(--color-primary)">₹${order.total}</strong>
        </div>
        <div style="display:flex; justify-content:space-between">
          <span>Est. Preparation Time:</span>
          <strong>15 mins</strong>
        </div>
      </div>

      <button class="cart-checkout-btn" style="width:100%" onclick="trackOrderFromConfirmation('${order.id}')">
        Track Order Live 📦
      </button>
    </div>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

function trackOrderFromConfirmation(orderId) {
  closeConfirmationModal();
  Router.go("orders");
}


/* ═══════════════════════════════════════════════════════════
   PART 6 & 9 — STUDENT LIVE TRACKING & MY ORDERS PAGE
   ═══════════════════════════════════════════════════════════ */
let _activeTrackingId = null;

function renderOrdersPage() {
  const container = document.getElementById("orders-page-container");
  if (!container) return;

  const orders = OrderService.getStudentOrders("STU-2024");

  if (orders.length === 0) {
    container.innerHTML = `
      <div style="min-height:50vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:16px; text-align:center">
        <div style="font-size:3.5rem">📦</div>
        <h2 style="font-family:var(--font-heading); color:var(--color-primary)">No Active Orders</h2>
        <p style="color:var(--color-text-muted); max-width:360px; font-size:0.88rem">Browse our canteen menu and place your first food order!</p>
        <button class="btn btn-green" onclick="Router.go('menu')">Browse Menu</button>
      </div>`;
    return;
  }

  // Active tracked order (first non-completed or specified ID, or most recent)
  const trackedOrder = _activeTrackingId
    ? orders.find(o => o.id === _activeTrackingId) || orders[0]
    : orders.find(o => o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'rejected') || orders[0];

  _activeTrackingId = trackedOrder.id;

  const trackingHTML = buildLiveTrackingHTML(trackedOrder);
  const historyHTML = buildOrderHistoryHTML(orders);

  container.innerHTML = trackingHTML + historyHTML;
}

function buildLiveTrackingHTML(order) {
  const statusMap = {
    pending: { step: 1, label: "Order Placed" },
    accepted: { step: 2, label: "Accepted by Kitchen" },
    preparing: { step: 3, label: "Preparing Food" },
    ready: { step: 4, label: "Ready for Pickup" },
    completed: { step: 5, label: "Completed" },
    rejected: { step: 0, label: "Rejected by Kitchen" },
    cancelled: { step: 0, label: "Cancelled" }
  };

  const curr = statusMap[order.status] || statusMap.pending;
  const isReady = order.status === 'ready';

  return `
    <div class="tracking-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px">
        <div>
          <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:#6b6b6b">Live Order Tracker</div>
          <div style="font-size:2.2rem; font-weight:800; color:var(--color-primary,#1e4d2b)">${order.token}</div>
        </div>
        <div style="text-align:right">
          <span class="status-badge" style="background:${isReady ? '#edf7ee' : '#fdf3e0'}; color:${isReady ? '#1e4d2b' : '#c8862a'}; font-size:0.8rem; padding:6px 14px">
            ${curr.label.toUpperCase()}
          </span>
          <div style="font-size:0.78rem; color:#6b6b6b; margin-top:4px">📍 ${order.pickupLocation}</div>
        </div>
      </div>

      ${isReady ? `
        <div class="ready-pickup-banner">
          <div style="font-size:1.6rem; margin-bottom:4px">🎉 YOUR ORDER IS READY FOR PICKUP!</div>
          <div style="font-size:0.95rem; font-weight:600">Please show Token <strong>${order.token}</strong> at ${order.pickupLocation}</div>
        </div>
      ` : ''}

      <!-- Timeline Progress -->
      <div class="tracking-timeline">
        <div class="tracking-step ${curr.step >= 1 ? (curr.step === 1 ? 'active' : 'done') : ''}">
          <div class="tracking-step__icon">${curr.step > 1 ? '✓' : '1'}</div>
          <div class="tracking-step__label">Placed</div>
        </div>
        <div class="tracking-step ${curr.step >= 2 ? (curr.step === 2 ? 'active' : 'done') : ''}">
          <div class="tracking-step__icon">${curr.step > 2 ? '✓' : '2'}</div>
          <div class="tracking-step__label">Accepted</div>
        </div>
        <div class="tracking-step ${curr.step >= 3 ? (curr.step === 3 ? 'active' : 'done') : ''}">
          <div class="tracking-step__icon">${curr.step > 3 ? '✓' : '3'}</div>
          <div class="tracking-step__label">Preparing</div>
        </div>
        <div class="tracking-step ${curr.step >= 4 ? (curr.step === 4 ? 'active' : 'done') : ''}">
          <div class="tracking-step__icon">${curr.step > 4 ? '✓' : '4'}</div>
          <div class="tracking-step__label">Ready</div>
        </div>
        <div class="tracking-step ${curr.step >= 5 ? 'done' : ''}">
          <div class="tracking-step__icon">5</div>
          <div class="tracking-step__label">Collected</div>
        </div>
      </div>

      <div style="font-size:0.88rem; background:var(--color-bg,#faf8f3); padding:14px; border-radius:10px">
        <div style="font-weight:700; margin-bottom:6px">Items: ${order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</div>
        <div style="color:#6b6b6b">Total Price: <strong style="color:var(--color-text)">₹${order.total}</strong> • Paid via ${order.paymentMethod}</div>
      </div>
    </div>
  `;
}

function buildOrderHistoryHTML(orders) {
  return `
    <h3 style="font-family:var(--font-heading); color:var(--color-primary); margin-bottom:16px">Order History</h3>
    <div style="display:flex; flex-direction:column; gap:12px">
      ${orders.map(o => {
    const timeStr = new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
          <div style="background:#ffffff; border:1px solid var(--color-border-light,#eaf0e4); border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center; cursor:pointer"
               onclick="selectTrackOrder('${o.id}')">
            <div>
              <div style="display:flex; align-items:center; gap:10px">
                <span style="font-size:1.2rem; font-weight:800; color:var(--color-primary,#1e4d2b)">${o.token}</span>
                <span style="font-size:0.78rem; color:#6b6b6b">${timeStr}</span>
              </div>
              <div style="font-size:0.88rem; font-weight:600; margin-top:4px">${o.items.map(i => `${i.name} x${i.qty}`).join(', ')}</div>
            </div>
            <div style="text-align:right">
              <span class="status-badge" style="background:#f4f0e8; color:#1a1a1a; font-size:0.75rem">
                ${o.status.toUpperCase()}
              </span>
              <div style="font-weight:700; margin-top:4px">₹${o.total}</div>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function selectTrackOrder(id) {
  _activeTrackingId = id;
  renderOrdersPage();
}

// Reactive order update subscription
OrderService.subscribe(() => {
  if (Router.current() === "orders") {
    renderOrdersPage();
  }
});


/* ═══════════════════════════════════════════════════════════
   FOOD CARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
function createFoodCardHTML(item) {
  const qty = Cart.getQty(item.id);
  const totalCount = Cart.totalCount;
  const isMaxReached = totalCount >= 8;

  /* Image vs emoji fallback */
  const hasImg = Boolean(item.imageUrl);
  const imgHTML = hasImg
    ? `<img class="food-card__img" src="${item.imageUrl}" alt="${item.name}" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';

  const stepperHTML = qty > 0
    ? `<div class="card-qty-stepper" data-card-stepper="${item.id}">
         <button onclick="event.stopPropagation(); Cart.removeItem('${item.id}')" aria-label="Decrease">−</button>
         <span class="qty-num">${qty}</span>
         <button ${isMaxReached ? 'disabled style="opacity:0.4; cursor:not-allowed"' : ''} 
                 onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                 aria-label="Increase">+</button>
       </div>`
    : `<button class="card-add-btn" 
         ${!item.available || isMaxReached ? "disabled" : ""}
         onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})"
         aria-label="Add ${item.name}">+</button>`;

  return `
    <div class="food-card ${!item.available ? 'unavailable' : ''}" 
         id="food-card-${item.id}"
         onclick="openFoodDetail('${item.id}')"
         role="button" tabindex="0"
         aria-label="${item.name}, ₹${item.price}">
      <div class="food-card__img-wrap" style="${itemGradient(item)}">
        ${imgHTML}
        <div class="food-card__emoji-fallback" style="display:${hasImg ? 'none' : 'flex'}">
          ${item.emoji}
        </div>
        ${!item.available ? `<div class="food-card__unavail-overlay">Unavailable Today</div>` : ''}
      </div>
      <div class="food-card__body">
        <div class="food-card__top">
          <span class="food-card__name">${item.name}</span>
          <span class="veg-indicator ${item.isVeg ? 'veg' : 'non-veg'}" 
                title="${item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}"></span>
        </div>
        <p class="food-card__desc">${item.description}</p>
        <div class="food-card__footer">
          <span class="food-card__price"><span>₹</span>${item.price}</span>
          <div data-card-action="${item.id}">
            ${stepperHTML}
          </div>
        </div>
      </div>
    </div>`;
}

function updateAllCardSteppers() {
  const totalCount = Cart.totalCount;
  const isMaxReached = totalCount >= 8;

  document.querySelectorAll("[data-card-action]").forEach(wrapper => {
    const id = wrapper.dataset.cardAction;
    const item = getMenuItemById(id);
    if (!item) return;
    const qty = Cart.getQty(id);

    if (qty > 0) {
      wrapper.innerHTML = `
        <div class="card-qty-stepper" data-card-stepper="${id}">
          <button onclick="event.stopPropagation(); Cart.removeItem('${id}')" aria-label="Decrease">−</button>
          <span class="qty-num">${qty}</span>
          <button ${isMaxReached ? 'disabled style="opacity:0.4; cursor:not-allowed"' : ''} 
                  onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                  aria-label="Increase">+</button>
        </div>`;
    } else {
      wrapper.innerHTML = `
        <button class="card-add-btn" 
          ${!item.available || isMaxReached ? "disabled" : ""}
          onclick="event.stopPropagation(); Cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})"
          aria-label="Add ${item.name}">+</button>`;
    }
  });
}


/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */
function renderHomePage() {
  const grid = document.getElementById("home-food-grid");
  if (!grid) return;

  const featured = FEATURED_ITEMS.map(id => getMenuItemById(id)).filter(Boolean);
  grid.innerHTML = featured.map(createFoodCardHTML).join("");
}


/* ═══════════════════════════════════════════════════════════
   MENU PAGE & FILTERING (PART 1 - SEPARATED CATEGORY CARDS)
   ═══════════════════════════════════════════════════════════ */
let _activeCategory = "all";
let _vegFilter = "all";
let _searchQuery = "";

function renderMenuPage() {
  renderCategoryPills();
  renderMenuGrid();
  initSearchInput();
  updateVegFilterPillsUI();
}

/** Render primary category tabs matching HTML id category-tabs */
function renderCategoryPills() {
  const container = document.getElementById("category-tabs");
  if (!container) return;

  container.innerHTML = MENU_CATEGORIES.map(cat => `
    <button class="category-pill ${cat.id === _activeCategory ? 'active' : ''}"
            onclick="setCategory('${cat.id}')"
            role="tab"
            aria-selected="${cat.id === _activeCategory}"
            aria-label="Filter by ${cat.label}">
      ${cat.label}
    </button>
  `).join("");
}

function setCategory(catId) {
  _activeCategory = catId;
  _searchQuery = "";
  const searchEl = document.getElementById("menu-search");
  if (searchEl) searchEl.value = "";
  renderCategoryPills();
  renderMenuGrid();
}

/** Global dietary filter function for inline onclick on veg pills */
window.setVegFilter = function (filter) {
  _vegFilter = filter;
  updateVegFilterPillsUI();
  renderMenuGrid();
};

function updateVegFilterPillsUI() {
  const btnAll = document.getElementById("veg-pill-all");
  const btnVeg = document.getElementById("veg-pill-veg");
  const btnNonveg = document.getElementById("veg-pill-nonveg");

  if (btnAll) btnAll.className = `veg-pill ${_vegFilter === 'all' ? 'active-all' : ''}`;
  if (btnVeg) btnVeg.className = `veg-pill ${_vegFilter === 'veg' ? 'active-veg' : ''}`;
  if (btnNonveg) btnNonveg.className = `veg-pill ${_vegFilter === 'non-veg' ? 'active-nonveg' : ''}`;
}

function initSearchInput() {
  const searchEl = document.getElementById("menu-search");
  if (!searchEl) return;

  searchEl.addEventListener("input", e => {
    _searchQuery = e.target.value;
    renderMenuGrid();
  });
}

function renderMenuGrid() {
  const grid = document.getElementById("menu-food-grid");
  const countLabel = document.getElementById("menu-results-label");
  if (!grid) return;

  let items = _searchQuery.trim()
    ? searchMenuItems(_searchQuery)
    : getMenuItems(_activeCategory, _vegFilter);

  if (_searchQuery.trim() && _vegFilter !== "all") {
    items = items.filter(i => _vegFilter === "veg" ? i.isVeg === true : i.isVeg === false);
  }

  if (countLabel) {
    countLabel.textContent = `Showing ${items.length} item${items.length === 1 ? '' : 's'}`;
  }

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align:center; padding: 60px 20px;">
        <div style="font-size:3rem; margin-bottom:12px">🍃</div>
        <p style="font-family:var(--font-heading); font-size:1.2rem; margin-bottom:6px">No dishes found</p>
        <p style="color:var(--color-text-muted); font-size:0.88rem">Try selecting a different category or dietary filter</p>
      </div>`;
    return;
  }

  grid.innerHTML = items.map(createFoodCardHTML).join("");
}


/* ═══════════════════════════════════════════════════════════
   FOOD DETAIL MODAL SHEET
   ═══════════════════════════════════════════════════════════ */
let _detailItem = null;
let _detailQty = 1;

function openFoodDetail(id) {
  const item = getMenuItemById(id);
  if (!item) return;

  _detailItem = item;
  const currentInCart = Cart.getQty(id);
  const countWithoutItem = Cart.totalCount - currentInCart;
  const maxAllowedForThisItem = Math.max(1, 8 - countWithoutItem);

  _detailQty = Math.min(maxAllowedForThisItem, Math.max(1, currentInCart || 1));

  const modal = document.getElementById("food-modal");
  const content = document.getElementById("food-modal-content");

  if (!modal || !content) return;

  content.innerHTML = buildDetailHTML(item, _detailQty);
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function buildDetailHTML(item, qty) {
  const hasImg = Boolean(item.imageUrl);
  const currentInCart = Cart.getQty(item.id);
  const countWithoutItem = Cart.totalCount - currentInCart;
  const isMaxReached = (countWithoutItem + qty) >= 8;

  return `
    <div class="modal-sheet__img" style="${itemGradient(item)}">
      ${hasImg ? `<img class="modal-sheet__img-photo" src="${item.imageUrl}" alt="${item.name}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
      <div class="modal-sheet__img-emoji" style="display:${hasImg ? 'none' : 'flex'}">${item.emoji}</div>
    </div>
    <div class="modal-sheet__body">
      <div class="modal-sheet__top">
        <h2 class="modal-sheet__name">${item.name}</h2>
        <button class="modal-sheet__close" onclick="closeFoodDetail()" aria-label="Close">✕</button>
      </div>
      <div class="modal-sheet__meta">
        <span class="modal-sheet__price">₹${item.price}</span>
        <span class="veg-indicator ${item.isVeg ? 'veg' : 'non-veg'}" 
              title="${item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}"></span>
        <span class="avail-tag ${item.available ? 'available' : 'unavailable'}">
          ${item.available ? '✦ Available' : '✕ Unavailable Today'}
        </span>
      </div>
      <p class="modal-sheet__desc">${item.description}</p>
      <div class="modal-qty-row">
        <div class="modal-qty-stepper" id="modal-stepper">
          <button onclick="changeModalQty(-1)" aria-label="Decrease">−</button>
          <span class="qty-num" id="modal-qty-num">${qty}</span>
          <button onclick="changeModalQty(1)" aria-label="Increase">+</button>
        </div>
        <button class="modal-add-btn" 
                ${!item.available ? "disabled style='background:var(--color-text-light);cursor:not-allowed'" : ""}
                onclick="addToCartFromModal()">
          ${item.available ? `Add to Cart – ₹${item.price * qty}` : 'Unavailable'}
        </button>
      </div>
    </div>`;
}

function changeModalQty(delta) {
  if (!_detailItem) return;
  const currentInCart = Cart.getQty(_detailItem.id);
  const countWithoutItem = Cart.totalCount - currentInCart;

  if (delta > 0 && (countWithoutItem + _detailQty + delta) > 8) {
    showToast("⚠️ Order limit reached (8 items max)");
    return;
  }

  _detailQty = Math.max(1, _detailQty + delta);
  const numEl = document.getElementById("modal-qty-num");
  if (numEl) numEl.textContent = _detailQty;

  const btn = document.querySelector(".modal-add-btn");
  if (btn && _detailItem.available) {
    btn.textContent = `Add to Cart – ₹${_detailItem.price * _detailQty}`;
  }
}

function addToCartFromModal() {
  if (!_detailItem || !_detailItem.available) return;

  Cart.setQty(_detailItem.id, _detailQty);
  closeFoodDetail();
  showToast(`✅ ${_detailItem.name} updated in cart`);
}

function closeFoodDetail() {
  const modal = document.getElementById("food-modal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
  _detailItem = null;
}

const foodModalEl = document.getElementById("food-modal");
if (foodModalEl) {
  foodModalEl.addEventListener("click", function (e) {
    if (e.target === this) closeFoodDetail();
  });
}


/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */
function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fadeout");
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}


/* ═══════════════════════════════════════════════════════════
   INIT APP ON DOM LOAD
   ═══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  renderHomePage();
  Router.go("home");
});
