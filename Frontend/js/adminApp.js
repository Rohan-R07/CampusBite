/**
 * GD Palate – Canteen Admin / Staff Dashboard JS Application
 * Handles state management, UI rendering, Kanban order transitions,
 * menu management, analytics, and detail modals.
 */

(function () {
  /* ─── State Management ───────────────────────────────────── */
  let ordersState = typeof OrderService !== 'undefined' ? OrderService.getOrders() : [...MOCK_ORDERS];
  let menuState = typeof MENU_DATA !== 'undefined' ? [...MENU_DATA] : [];
  let currentTab = 'dashboard';
  let analyticsTimeframe = 'today';
  let selectedOrderId = null;
  let editingFoodId = null;

  if (typeof OrderService !== 'undefined') {
    OrderService.subscribe(updatedOrders => {
      ordersState = updatedOrders;
      renderAll();
    });
  }

  function saveOrders() {
    localStorage.setItem('gd_palate_admin_orders', JSON.stringify(ordersState));
  }

  function saveMenu() {
    localStorage.setItem('gd_palate_admin_menu', JSON.stringify(menuState));
  }

  /* ─── DOM References ─────────────────────────────────────── */
  const navItems = document.querySelectorAll('.admin-nav-item');
  const pages = document.querySelectorAll('.admin-page');
  const topbarTitle = document.getElementById('topbar-title');
  const clockEl = document.getElementById('topbar-clock');

  /* Modals */
  const orderModalOverlay = document.getElementById('order-detail-modal');
  const foodModalOverlay = document.getElementById('food-modal');

  /* ─── Initialization ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initNavigation();
    renderAll();
    initFormHandlers();
  });

  function initClock() {
    function updateTime() {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    updateTime();
    setInterval(updateTime, 1000);
  }

  /* ─── Sidebar Navigation ─────────────────────────────────── */
  function initNavigation() {
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });
  }

  function switchTab(tabName) {
    currentTab = tabName;
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });
    pages.forEach(page => {
      page.classList.toggle('active', page.id === `page-${tabName}`);
    });

    const titles = {
      dashboard: 'Dashboard Overview',
      'live-orders': 'Live Orders Kanban',
      'menu-mgmt': 'Menu Management',
      analytics: 'Sales & Analytics'
    };
    if (topbarTitle) topbarTitle.textContent = titles[tabName] || 'Admin Dashboard';

    renderAll();
  }

  /* ─── Main Render Dispatcher ─────────────────────────────── */
  function renderAll() {
    renderSidebarCounts();
    if (currentTab === 'dashboard') renderDashboard();
    if (currentTab === 'live-orders') renderKanban();
    if (currentTab === 'menu-mgmt') renderMenuManagement();
    if (currentTab === 'analytics') renderAnalytics();
  }

  function renderSidebarCounts() {
    const pendingCount = ordersState.filter(o => o.status === 'pending').length;
    const badgeEl = document.getElementById('sidebar-pending-badge');
    if (badgeEl) {
      badgeEl.textContent = pendingCount;
      badgeEl.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
  }

  /* ─── 1. DASHBOARD PAGE ──────────────────────────────────── */
  function renderDashboard() {
    const pending   = ordersState.filter(o => o.status === 'pending').length;
    const preparing = ordersState.filter(o => o.status === 'preparing' || o.status === 'accepted').length;
    const ready     = ordersState.filter(o => o.status === 'ready').length;
    const completed = ordersState.filter(o => o.status === 'completed').length;
    const revenue   = ordersState.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);

    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-preparing').textContent = preparing;
    document.getElementById('stat-ready').textContent = ready;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-revenue').textContent = `₹${revenue.toLocaleString()}`;

    // Live Activity Stream (Recent active orders)
    const streamContainer = document.getElementById('live-stream-list');
    if (streamContainer) {
      const activeOrders = ordersState.slice(0, 5);
      if (activeOrders.length === 0) {
        streamContainer.innerHTML = `<div class="kanban-empty">No order activity yet.</div>`;
      } else {
        streamContainer.innerHTML = activeOrders.map(o => {
          const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;
          const timeAgo = formatTimeAgo(o.createdAt);
          const itemsSummary = o.items.map(i => `${i.name} (x${i.qty})`).join(', ');
          return `
            <div class="stream-item" onclick="window.AdminApp.openOrderModal('${o.id}')">
              <div class="stream-item__left">
                <span class="stream-token">${o.token}</span>
                <div class="stream-info">
                  <div class="stream-info__items">${itemsSummary}</div>
                  <div class="stream-info__meta">${o.customerRef} • ${timeAgo}</div>
                </div>
              </div>
              <div class="stream-item__right">
                <span class="status-badge" style="background:${cfg.bg}; color:${cfg.color}">
                  ${cfg.label}
                </span>
                <span style="font-weight:700; font-size:0.9rem">₹${o.total}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Top Selling Items (Dashboard card)
    const topContainer = document.getElementById('dash-top-items');
    if (topContainer) {
      const topData = ANALYTICS_MOCK.today.topItems.slice(0, 4);
      topContainer.innerHTML = topData.map(item => `
        <div class="top-item-row">
          <div class="top-item-info">
            <div class="top-item-emoji">${item.emoji}</div>
            <div>
              <div class="top-item-name">${item.name}</div>
              <div class="top-item-qty">${item.qty} sold today</div>
            </div>
          </div>
          <div class="top-item-rev">₹${item.revenue}</div>
        </div>
      `).join('');
    }
  }

  /* ─── 2. LIVE ORDERS KANBAN ──────────────────────────────── */
  function renderKanban() {
    const cols = {
      'col-pending':   document.getElementById('col-pending-cards'),
      'col-preparing': document.getElementById('col-preparing-cards'),
      'col-ready':     document.getElementById('col-ready-cards'),
      'col-completed': document.getElementById('col-completed-cards')
    };

    const counts = { 'col-pending': 0, 'col-preparing': 0, 'col-ready': 0, 'col-completed': 0 };

    Object.values(cols).forEach(el => { if (el) el.innerHTML = ''; });

    ordersState.forEach(order => {
      const colKey = getKanbanColumn(order.status);
      if (!colKey || !cols[colKey]) return;

      counts[colKey]++;
      const cardHTML = buildOrderCardHTML(order);
      cols[colKey].insertAdjacentHTML('beforeend', cardHTML);
    });

    // Update Kanban Column Counters
    document.getElementById('count-pending').textContent = counts['col-pending'];
    document.getElementById('count-preparing').textContent = counts['col-preparing'];
    document.getElementById('count-ready').textContent = counts['col-ready'];
    document.getElementById('count-completed').textContent = counts['col-completed'];

    // Show empty state placeholder if empty
    Object.keys(cols).forEach(key => {
      if (counts[key] === 0 && cols[key]) {
        cols[key].innerHTML = `<div class="kanban-empty">No orders here right now.</div>`;
      }
    });
  }

  function buildOrderCardHTML(order) {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const actions = getOrderActions(order.status);
    const timeAgo = formatTimeAgo(order.createdAt);

    const itemsHTML = order.items.map(i => `
      <div class="order-card__item-line">
        <span class="order-card__item-name">${i.name}</span>
        <span class="order-card__item-qty">x${i.qty}</span>
      </div>
    `).join('');

    const actionBtns = actions.map(act => `
      <button class="${act.style}" onclick="event.stopPropagation(); window.AdminApp.updateOrderStatus('${order.id}', '${act.newStatus}')">
        ${act.label}
      </button>
    `).join('');

    return `
      <div class="order-card" onclick="window.AdminApp.openOrderModal('${order.id}')">
        <div class="order-card__header">
          <div>
            <div class="order-card__token">${order.token}</div>
            <div class="order-card__customer">${order.customerRef}</div>
          </div>
          <div class="order-card__time">${timeAgo}</div>
        </div>
        <div class="order-card__items">
          ${itemsHTML}
        </div>
        <div class="order-card__footer">
          <span class="status-badge" style="background:${cfg.bg}; color:${cfg.color}">
            ${cfg.label}
          </span>
          <span class="order-card__total">₹${order.total}</span>
        </div>
        ${actionBtns ? `<div class="order-card__actions">${actionBtns}</div>` : ''}
      </div>
    `;
  }

  /* Status Transition Logic with Validation */
  function updateOrderStatus(orderId, newStatus) {
    const order = ordersState.find(o => o.id === orderId);
    if (!order) return;

    // Validate Status Transitions per Specification
    const validTransitions = {
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['completed'],
      completed: [],
      rejected: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(newStatus)) {
      showAdminToast(`⚠️ Invalid transition from ${order.status} to ${newStatus}`);
      return;
    }

    if (typeof OrderService !== 'undefined') {
      OrderService.updateOrderStatus(orderId, newStatus);
    } else {
      order.status = newStatus;
      saveOrders();
    }
    renderAll();
    showAdminToast(`Order ${order.token} updated to ${STATUS_CONFIG[newStatus].label}!`);

    // If detail modal is open, refresh it
    if (selectedOrderId === orderId) {
      openOrderModal(orderId);
    }
  }

  /* ─── 3. ORDER DETAILS MODAL ─────────────────────────────── */
  function openOrderModal(orderId) {
    selectedOrderId = orderId;
    const order = ordersState.find(o => o.id === orderId);
    if (!order) return;

    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const actions = getOrderActions(order.status);
    const formattedDate = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const modalBody = document.getElementById('order-detail-body');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <span style="font-size:2.2rem; font-weight:800; color:var(--color-primary,#1e4d2b)">${order.token}</span>
          <div style="font-size:0.85rem; color:var(--color-text-muted,#6b6b6b)">Order ID: ${order.id} • ${order.customerRef}</div>
        </div>
        <span class="status-badge" style="background:${cfg.bg}; color:${cfg.color}; font-size:0.85rem; padding:6px 14px;">
          ${cfg.label}
        </span>
      </div>

      <div style="background:var(--color-bg,#faf8f3); padding:16px; border-radius:10px; margin-bottom:20px; font-size:0.88rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>Created Time:</span>
          <strong>${formattedDate} (${formatTimeAgo(order.createdAt)})</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>Payment Status:</span>
          <span style="font-weight:700; color:${order.paymentStatus === 'paid' ? '#2e7d32' : '#c8862a'}">
            ${order.paymentStatus.toUpperCase()}
          </span>
        </div>
        ${order.note ? `
          <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #d8e4d0; color:#c8862a; font-weight:600;">
            📝 Special Note: ${order.note}
          </div>` : ''}
      </div>

      <h4 style="margin:0 0 12px 0; font-family:var(--font-heading)">Order Items</h4>
      <div style="border:1px solid var(--color-border-light,#eaf0e4); border-radius:8px; overflow:hidden; margin-bottom:20px;">
        <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
          <thead style="background:var(--color-bg-alt,#f4f0e8);">
            <tr>
              <th style="padding:10px; text-align:left;">Item</th>
              <th style="padding:10px; text-align:center;">Qty</th>
              <th style="padding:10px; text-align:right;">Price</th>
              <th style="padding:10px; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr style="border-bottom:1px solid #f4f0e8;">
                <td style="padding:10px; font-weight:600;">${item.name}</td>
                <td style="padding:10px; text-align:center;">${item.qty}</td>
                <td style="padding:10px; text-align:right;">₹${item.price}</td>
                <td style="padding:10px; text-align:right; font-weight:700;">₹${item.price * item.qty}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display:flex; flex-direction:column; gap:6px; font-size:0.88rem; align-items:flex-end; margin-bottom:20px;">
        <div>Subtotal: <strong>₹${order.subtotal}</strong></div>
        ${order.gst > 0 ? `<div>Tax: <strong>₹${order.gst}</strong></div>` : ''}
        <div style="font-size:1.1rem; font-weight:800; color:var(--color-primary,#1e4d2b)">
          Total Amount: ₹${order.total}
        </div>
      </div>

      ${actions.length > 0 ? `
        <div style="border-top:1px solid #eaf0e4; padding-top:16px;">
          <div style="font-size:0.8rem; text-transform:uppercase; color:#6b6b6b; font-weight:700; margin-bottom:10px;">Available Actions</div>
          <div style="display:flex; gap:10px;">
            ${actions.map(act => `
              <button class="${act.style}" style="padding:10px 16px;" onclick="window.AdminApp.updateOrderStatus('${order.id}', '${act.newStatus}')">
                ${act.label}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    orderModalOverlay.classList.add('open');
  }

  function closeOrderModal() {
    if (orderModalOverlay) orderModalOverlay.classList.remove('open');
    selectedOrderId = null;
  }

  /* ─── 4. MENU MANAGEMENT ─────────────────────────────────── */
  function renderMenuManagement() {
    const tableBody = document.getElementById('menu-table-body');
    const categoryFilter = document.getElementById('menu-category-filter')?.value || 'all';
    const searchQuery = document.getElementById('menu-search-input')?.value.toLowerCase().trim() || '';

    if (!tableBody) return;

    let filtered = menuState.filter(item => {
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchSearch = item.name.toLowerCase().includes(searchQuery) || item.category.toLowerCase().includes(searchQuery);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#9b9b9b;">No food items found matching your filter.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(item => `
      <tr>
        <td>
          <div class="admin-food-thumb">
            ${item.imageUrl 
              ? `<img src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` 
              : ''}
            <span style="display:${item.imageUrl ? 'none' : 'flex'}">${item.emoji || '🌿'}</span>
          </div>
        </td>
        <td>
          <div style="font-weight:700; color:var(--color-text,#1a1a1a)">${item.name}</div>
          <div style="font-size:0.78rem; color:var(--color-text-muted,#6b6b6b)">${item.description || ''}</div>
        </td>
        <td>
          <span style="background:var(--color-bg-alt,#f4f0e8); padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:600; text-transform:capitalize;">
            ${item.category}
          </span>
        </td>
        <td style="font-weight:700; color:var(--color-primary,#1e4d2b)">₹${item.price}</td>
        <td>
          <label class="switch">
            <input type="checkbox" ${item.available ? 'checked' : ''} onchange="window.AdminApp.toggleAvailability('${item.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="table-btn" onclick="window.AdminApp.openEditFoodModal('${item.id}')">Edit</button>
          <button class="table-btn table-btn--delete" onclick="window.AdminApp.deleteFoodItem('${item.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function toggleAvailability(foodId, isAvailable) {
    const item = menuState.find(m => m.id === foodId);
    if (item) {
      item.available = isAvailable;
      saveMenu();
      showAdminToast(`${item.name} is now ${isAvailable ? 'Available' : 'Out of Stock'}`);
    }
  }

  function deleteFoodItem(foodId) {
    const item = menuState.find(m => m.id === foodId);
    if (!item) return;
    if (confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
      menuState = menuState.filter(m => m.id !== foodId);
      saveMenu();
      renderMenuManagement();
      showAdminToast(`Deleted ${item.name} from menu.`);
    }
  }

  function openAddFoodModal() {
    editingFoodId = null;
    document.getElementById('food-modal-title').textContent = 'Add New Food Item';
    document.getElementById('food-form').reset();
    document.getElementById('food-available').checked = true;
    foodModalOverlay.classList.add('open');
  }

  function openEditFoodModal(foodId) {
    const item = menuState.find(m => m.id === foodId);
    if (!item) return;

    editingFoodId = foodId;
    document.getElementById('food-modal-title').textContent = 'Edit Food Item';
    document.getElementById('food-name').value = item.name;
    document.getElementById('food-category').value = item.category;
    document.getElementById('food-price').value = item.price;
    document.getElementById('food-image').value = item.imageUrl || '';
    document.getElementById('food-desc').value = item.description || '';
    document.getElementById('food-available').checked = Boolean(item.available);

    foodModalOverlay.classList.add('open');
  }

  function closeFoodModal() {
    if (foodModalOverlay) foodModalOverlay.classList.remove('open');
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('food-name').value.trim();
    const category = document.getElementById('food-category').value;
    const price = parseFloat(document.getElementById('food-price').value);
    const imageUrl = document.getElementById('food-image').value.trim();
    const description = document.getElementById('food-desc').value.trim();
    const available = document.getElementById('food-available').checked;

    if (!name || isNaN(price)) {
      alert('Please provide a valid name and price.');
      return;
    }

    if (editingFoodId) {
      const item = menuState.find(m => m.id === editingFoodId);
      if (item) {
        item.name = name;
        item.category = category;
        item.price = price;
        item.imageUrl = imageUrl;
        item.description = description;
        item.available = available;
        showAdminToast(`Updated item "${name}"`);
      }
    } else {
      const newItem = {
        id: 'item_' + Date.now(),
        name,
        category,
        price,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        description,
        available,
        emoji: '🍽️'
      };
      menuState.unshift(newItem);
      showAdminToast(`Added "${name}" to menu!`);
    }

    saveMenu();
    closeFoodModal();
    renderMenuManagement();
  }

  /* ─── 5. SALES & ANALYTICS ───────────────────────────────── */
  function renderAnalytics() {
    const data = ANALYTICS_MOCK[analyticsTimeframe] || ANALYTICS_MOCK.today;

    document.getElementById('analytics-orders').textContent = data.totalOrders;
    document.getElementById('analytics-revenue').textContent = `₹${data.revenue.toLocaleString()}`;
    document.getElementById('analytics-aov').textContent = `₹${data.avgOrderValue}`;
    document.getElementById('analytics-top-item').textContent = data.topItems[0].name;

    // Render Bar Chart
    const chartContainer = document.getElementById('bar-chart-container');
    if (chartContainer) {
      const maxVal = Math.max(...data.chartData);
      chartContainer.innerHTML = data.chartLabels.map((label, idx) => {
        const val = data.chartData[idx];
        const heightPct = Math.max(12, Math.round((val / maxVal) * 100));
        return `
          <div class="bar-column">
            <div class="bar-fill" style="height:${heightPct}%" data-value="${val} orders"></div>
            <div class="bar-label">${label}</div>
          </div>
        `;
      }).join('');
    }

    // Render Popular Items Table
    const topTable = document.getElementById('analytics-top-table');
    if (topTable) {
      topTable.innerHTML = data.topItems.map((item, i) => `
        <tr>
          <td style="font-weight:700; color:var(--color-primary,#1e4d2b);">#${i + 1}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${item.emoji}</span>
              <strong style="color:var(--color-text,#1a1a1a);">${item.name}</strong>
            </div>
          </td>
          <td style="text-align:center; font-weight:600;">${item.qty} units</td>
          <td style="text-align:right; font-weight:700; color:var(--color-primary,#1e4d2b);">₹${item.revenue.toLocaleString()}</td>
        </tr>
      `).join('');
    }
  }

  function setAnalyticsTimeframe(timeframe) {
    analyticsTimeframe = timeframe;
    document.querySelectorAll('.date-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-frame') === timeframe);
    });
    renderAnalytics();
  }

  /* ─── Form Event Listeners ───────────────────────────────── */
  function initFormHandlers() {
    const foodForm = document.getElementById('food-form');
    if (foodForm) foodForm.addEventListener('submit', handleFoodFormSubmit);

    // Search and Category filters in Menu Management
    const searchInput = document.getElementById('menu-search-input');
    const catSelect = document.getElementById('menu-category-filter');
    if (searchInput) searchInput.addEventListener('input', renderMenuManagement);
    if (catSelect) catSelect.addEventListener('change', renderMenuManagement);
  }

  /* ─── Toast System ───────────────────────────────────────── */
  function showAdminToast(message) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  /* ─── Helper Functions ───────────────────────────────────── */
  function formatTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    const diffMins = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  }

  /* ─── Global Exposure for Inline Event Handlers ─────────── */
  window.AdminApp = {
    switchTab,
    openOrderModal,
    closeOrderModal,
    updateOrderStatus,
    toggleAvailability,
    deleteFoodItem,
    openAddFoodModal,
    openEditFoodModal,
    closeFoodModal,
    setAnalyticsTimeframe,
    showAdminToast
  };
})();
