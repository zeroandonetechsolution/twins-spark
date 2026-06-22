(function () {
  'use strict';

  const PARTICLE_COUNT = 3;
  const USER_KEY = 'twins_spark_user';
  
  let currentUser = null;
  let cart = [];
  let wishlist = new Set();

  // Helper to get user-specific storage keys
  function getStorageKey(baseKey) {
    if (!currentUser) return baseKey;
    return `${baseKey}_${currentUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  // User session management
  function setUser(user) {
    currentUser = user;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    // Reload data for new user
    loadCart();
    loadWishlist();
    updateCartBadge();
    updateWishlistBadge();
    updateUserUI();
  }

  function loadUser() {
    try {
      currentUser = JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      currentUser = null;
    }
  }

  function logout() {
    setUser(null);
    window.location.href = 'login.html';
  }
  window.logout = logout;

  function updateUserUI() {
    // Update user profile button in navbar
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
      if (currentUser && currentUser.picture) {
        el.innerHTML = `<img src="${currentUser.picture}" alt="${currentUser.name}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
      } else {
        el.innerHTML = `<span data-icon="heart" style="font-size: 24px;"></span>`;
      }
    });

    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = currentUser ? currentUser.name : '';
    });

    // Show/hide logout button
    document.querySelectorAll('[data-logout-btn]').forEach(el => {
      el.style.display = currentUser ? 'inline-flex' : 'none';
    });
  }

  function handleUserProfileClick() {
    if (currentUser) {
      // If user is logged in, you could add a profile dropdown here
      showToast('You are logged in as ' + currentUser.name);
    } else {
      // If not logged in, open the login popup
      openLoginPopup();
    }
  }
  window.handleUserProfileClick = handleUserProfileClick;

  // Helper function to parse price string (e.g., "₹2,999" → 2999)
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.-]/g, ''));
  }

  // Helper function to format price with ₹
  function formatPrice(amount) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  // ── Storage ─────────────────────────────────────────────

  function loadCart() {
    try {
      const key = getStorageKey('twins_spark_cart');
      cart = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    const key = getStorageKey('twins_spark_cart');
    localStorage.setItem(key, JSON.stringify(cart));
    updateCartBadge();
  }

  function loadWishlist() {
    try {
      const key = getStorageKey('twins_spark_wishlist');
      wishlist = new Set(JSON.parse(localStorage.getItem(key)) || []);
    } catch {
      wishlist = new Set();
    }
  }

  function saveWishlist() {
    const key = getStorageKey('twins_spark_wishlist');
    localStorage.setItem(key, JSON.stringify([...wishlist]));
  }

  function loadProducts() {
    try {
      const stored = localStorage.getItem('twinsSparkProducts');
      if (stored) {
        window.PRODUCTS = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load products', e);
    }
  }

  function saveProducts() {
    try {
      if (window.PRODUCTS) {
        localStorage.setItem('twinsSparkProducts', JSON.stringify(window.PRODUCTS));
      }
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }

  function updateCartBadge() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
    });
  }

  function updateWishlistBadge() {
    const count = wishlist.size;
    document.querySelectorAll('[data-wishlist-count]').forEach((el) => {
      el.textContent = count;
    });
  }

  // ── Preloader ─────────────────────────────────────────

  function initPreloader() {
    const el = document.getElementById('preloader');
    if (!el) return;

    const isHomePage = document.body.classList.contains('page-home');
    const isAdminPage = document.body.classList.contains('page-admin');

    if (!isHomePage && !isAdminPage) {
      // Not home or admin, hide preloader immediately
      el.style.display = 'none';
      return;
    }

    setTimeout(() => {
      el.classList.add('is-hidden');
      setTimeout(() => el.remove(), 800);
    }, 4500);
  }

  // ── Smoke effect ──────────────────────────────────────

  function initSmoke() {
    const container = document.getElementById('smoke-container');
    if (!container) return;

    const particlesHost = document.getElementById('smoke-particles');
    if (!particlesHost) return;

    // Reduce particle count to 2 for better performance
    for (let i = 0; i < Math.min(PARTICLE_COUNT, 2); i++) {
      const startX = Math.random() * 100;
      const driftX = (Math.random() - 0.5) * 30;
      const particle = document.createElement('div');
      particle.className = 'smoke-particle-active';
      particle.style.setProperty('--smoke-start-x', `${startX}%`);
      particle.style.setProperty('--smoke-mid-x', `${startX + driftX}%`);
      particle.style.setProperty('--smoke-end-x', `${startX + driftX * 1.5}%`);
      particle.style.setProperty('--smoke-scale', String(Math.random() * 0.6 + 0.4));
      particle.style.setProperty('--smoke-duration', `${Math.random() * 20 + 60}s`);
      particle.style.setProperty('--smoke-delay', `${Math.random() * -60}s`);
      particlesHost.appendChild(particle);
    }
  }

  // ── Products ──────────────────────────────────────────

  function renderProducts(list, containerId) {
    const grid = document.getElementById(containerId || 'product-grid');
    if (!grid) return;

    const icons = window.ICONS || {};

    grid.innerHTML = list
      .map(
        (p) => {
          // Handle both old (price) and new (realPrice/offerPrice) formats
          const realPrice = p.realPrice || null;
          const offerPrice = p.offerPrice || p.price;
          // Use first image if available, otherwise p.image
          const mainImage = (p.images && p.images[0]?.src || p.images?.[0]) || p.image || '';

          return `
      <article class="product-card glass" data-product-id="${p.id}">
        <a href="product.html?id=${p.id}" class="product-link" aria-label="View ${p.name}">
          <div class="product-image-wrap">
            ${
              mainImage
                ? `<img src="${mainImage}" alt="${p.name}" loading="lazy">`
                : `<div class="product-image-placeholder">[Product Image: ${p.name}]</div>`
            }
            <button type="button" class="wishlist-btn${wishlist.has(p.id) ? ' is-active' : ''}" data-wishlist="${p.id}" aria-label="Add to wishlist" onclick="event.stopPropagation();">
              ${icons.heart || '♥'}
            </button>
          </div>
        </a>
        <p class="product-category">${p.category}</p>
        <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="product-footer">
          <div class="product-prices">
            ${realPrice ? `<span class="product-price-real">${realPrice}</span>` : ''}
            <span class="product-price">${offerPrice}</span>
          </div>
          <button type="button" class="btn-add" data-add-cart="${p.id}" aria-label="Add ${p.name} to cart">
            ${icons.cart || ''}
            Add
          </button>
        </div>
      </article>`;
        }
      )
      .join('');

    grid.querySelectorAll('[data-add-cart]').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(Number(btn.dataset.addCart)));
    });

    grid.querySelectorAll('[data-wishlist]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWishlist(Number(btn.dataset.wishlist), btn);
      });
    });
  }

  function addToCart(productId, options = null) {
    const product = (window.PRODUCTS || []).find((p) => p.id === productId);
    if (!product) return;

    // Find existing item with same id AND same options
    let existing = null;
    if (options) {
      existing = cart.find((i) => 
        i.id === productId && 
        JSON.stringify(i.options) === JSON.stringify(options)
      );
    } else {
      existing = cart.find((i) => i.id === productId && !i.options);
    }

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ 
        id: product.id, 
        name: product.name, 
        price: product.offerPrice || product.price,
        realPrice: product.realPrice || null,
        gst: product.gst || null,
        deliveryCost: product.deliveryCost || null,
        qty: 1,
        options: options,
        image: (product.images && product.images[0]?.src || product.images?.[0]) || product.image || ''
      });
    }

    saveCart();
    showToast(`${product.name} added to cart`);
  }
  window.addToCart = addToCart;

  function updateCartItemQty(index, qty) {
    if (qty < 1) {
      removeFromCart(index);
      return;
    }
    cart[index].qty = qty;
    saveCart();
    renderCart();
  }
  window.updateCartItemQty = updateCartItemQty;

  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }
  window.removeFromCart = removeFromCart;

  function calculateCartTotals() {
    let subtotal = 0;
    let totalGst = 0;
    let totalDelivery = 0;

    cart.forEach(item => {
      const itemPrice = parsePrice(item.price);
      subtotal += itemPrice * item.qty;

      if (item.gst) {
        const gstPercent = parsePrice(item.gst);
        totalGst += (itemPrice * gstPercent / 100) * item.qty;
      }

      if (item.deliveryCost) {
        const deliveryPrice = parsePrice(item.deliveryCost);
        // Add delivery cost once per unique item type
        const existingDelivery = cart.findIndex(i => i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options));
        if (existingDelivery === cart.indexOf(item)) {
          totalDelivery += deliveryPrice;
        }
      }
    });

    const total = subtotal + totalGst + totalDelivery;

    return {
      subtotal,
      totalGst,
      totalDelivery,
      total
    };
  }

  function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartContainer = document.getElementById('empty-cart');
    const cartSummaryContainer = document.getElementById('cart-summary');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '';
      emptyCartContainer.classList.remove('hidden');
      if (cartSummaryContainer) cartSummaryContainer.innerHTML = '';
      return;
    }

    emptyCartContainer.classList.add('hidden');

    cartItemsContainer.innerHTML = cart.map((item, index) => {
      const optionsText = item.options 
        ? Object.entries(item.options)
            .map(([key, value]) => {
              if (typeof value === 'object' && value.name) return `${key}: ${value.name}`;
              return `${key}: ${value}`;
            })
            .join(' • ')
        : '';

      return `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image || ''}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <h3>${item.name}</h3>
            ${optionsText ? `<p class="item-options">${optionsText}</p>` : ''}
            <p class="item-price">${item.price}</p>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateCartItemQty(${index}, ${item.qty - 1})">-</button>
            <input type="number" class="qty-input" value="${item.qty}" min="1" onchange="updateCartItemQty(${index}, parseInt(this.value))">
            <button class="qty-btn" onclick="updateCartItemQty(${index}, ${item.qty + 1})">+</button>
          </div>
          <button class="btn btn-danger" onclick="removeFromCart(${index})">Remove</button>
        </div>
      `;
    }).join('');

    if (cartSummaryContainer) {
      const totals = calculateCartTotals();
      cartSummaryContainer.innerHTML = `
        <h2 style="margin-top: 0; margin-bottom: 1.5rem;">Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(totals.subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>GST</span>
          <span>${formatPrice(totals.totalGst)}</span>
        </div>
        <div class="summary-row">
          <span>Delivery</span>
          <span>${formatPrice(totals.totalDelivery)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span style="color: var(--accent);">${formatPrice(totals.total)}</span>
        </div>
        <a href="checkout.html" class="btn btn-primary" style="display: block; text-align: center; text-decoration: none; margin-top: 1.5rem;">Proceed to Checkout</a>
      `;
    }
  }
  window.renderCart = renderCart;

  function renderCheckoutSummary() {
    const checkoutSummaryContainer = document.getElementById('checkout-summary');

    if (!checkoutSummaryContainer) return;

    if (cart.length === 0) {
      checkoutSummaryContainer.innerHTML = `
        <p style="text-align: center; color: rgba(255,255,255,0.6);">Your cart is empty</p>
        <a href="cart.html" class="btn btn-primary" style="display: block; text-align: center; text-decoration: none; margin-top: 1rem;">Go to Cart</a>
      `;
      return;
    }

    const totals = calculateCartTotals();

    checkoutSummaryContainer.innerHTML = `
      <h2 style="margin-top: 0; margin-bottom: 1.5rem;">Order Summary</h2>
      <div class="checkout-items">
        ${cart.map(item => `
          <div class="checkout-item">
            <div class="checkout-item-image">
              <img src="${item.image || ''}" alt="${item.name}">
            </div>
            <div class="checkout-item-info">
              <h4>${item.name} × ${item.qty}</h4>
              <p>${item.price}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${formatPrice(totals.subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>GST</span>
        <span>${formatPrice(totals.totalGst)}</span>
      </div>
      <div class="summary-row">
        <span>Delivery</span>
        <span>${formatPrice(totals.totalDelivery)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span style="color: var(--accent);">${formatPrice(totals.total)}</span>
      </div>
    `;
  }
  window.renderCheckoutSummary = renderCheckoutSummary;

  function placeOrder() {
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const phone = document.getElementById('phone').value;
    const country = document.getElementById('country').value;

    const order = {
      id: Date.now(),
      date: new Date().toISOString(),
      customer: {
        firstName, lastName, email, phone, address, city, state, zip, country
      },
      items: [...cart],
      totals: calculateCartTotals(),
      status: 'pending'
    };

    // Save order
    let orders = [];
    const key = getStorageKey('twins_spark_orders');
    try {
      orders = JSON.parse(localStorage.getItem(key)) || [];
    } catch {}
    orders.push(order);
    localStorage.setItem(key, JSON.stringify(orders));

    // Clear cart
    cart = [];
    saveCart();

    showToast('Order placed successfully!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
  window.placeOrder = placeOrder;

  function toggleWishlist(productId, btn) {
    if (wishlist.has(productId)) wishlist.delete(productId);
    else wishlist.add(productId);
    saveWishlist();
    updateWishlistBadge();
    if (btn) btn.classList.toggle('is-active', wishlist.has(productId));
  }
  window.toggleWishlist = toggleWishlist;

  function initCategoryPage() {
    const slug = document.body.dataset.category;
    if (!slug || !window.CATEGORY_MAP) return;

    const label = window.CATEGORY_MAP[slug];
    const filtered = (window.PRODUCTS || []).filter(
      (p) => p.category.toLowerCase() === label.toLowerCase()
    );
    renderProducts(filtered, 'product-grid');
  }

  // ── Mobile menu ───────────────────────────────────────

  function initMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-menu-overlay');
    const openBtn = document.getElementById('menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (!menu || !openBtn) return;

    function open() {
      menu.classList.add('is-open');
      overlay?.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
    }

    function close() {
      menu.classList.remove('is-open');
      overlay?.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
    }

    openBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  // ── Newsletter ────────────────────────────────────────

  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const msg = document.getElementById('newsletter-message');
      if (!input?.value.trim()) return;

      if (msg) {
        msg.textContent = 'Welcome to the galaxy! You are subscribed.';
        msg.hidden = false;
      }
      form.reset();
      showToast('Subscribed successfully!');
    });
  }

  // ── Search (focus prompt) ─────────────────────────────

  function initSearch() {
    document.querySelectorAll('[data-search-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = prompt('Search products:');
        if (!q) return;
        const results = (window.PRODUCTS || []).filter(
          (p) =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.category.toLowerCase().includes(q.toLowerCase())
        );
        const gridId = document.getElementById('trending-grid')
          ? 'trending-grid'
          : document.getElementById('product-grid')
            ? 'product-grid'
            : null;
        if (gridId) {
          const fallback = gridId === 'trending-grid'
            ? (window.PRODUCTS || []).filter((p) => p.trending)
            : window.PRODUCTS;
          renderProducts(results.length ? results : fallback, gridId);
          if (!results.length) showToast('No products found');
        } else {
          showToast(results.length ? `Found ${results.length} item(s)` : 'No products found');
        }
      });
    });
  }

  // ── Toast ─────────────────────────────────────────────

  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2500);
  }

  // ── Footer year ───────────────────────────────────────

  function setYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  // ── Init ──────────────────────────────────────────────

  function init() {
  // Clear old skipped login flag (if any)
  localStorage.removeItem('twinsSparkLoginSkipped');
  loadUser();
  loadCart();
  loadWishlist();
  loadProducts();
  initPreloader();
  initSmoke();
  initMobileMenu();
  initNewsletter();
  initSearch();
  setYear();
  updateCartBadge();
  updateWishlistBadge();
  updateUserUI();
  initLoginPopup();

  if (document.body.dataset.category) {
    initCategoryPage();
  } else if (document.body.classList.contains('page-home')) {
    initHomePage();
  } else if (document.getElementById('product-grid')) {
    renderProducts(window.PRODUCTS || []);
  }
}

// Login popup logic
function initLoginPopup() {
  const popup = document.getElementById('login-popup');
  const closeBtn = document.getElementById('close-login-popup');
  
  if (!popup || !document.body.classList.contains('page-home')) return;

  // Show popup every time if user is not logged in (after preloader)
  if (!currentUser) {
    // Show popup after preloader is done (about 5 seconds)
    setTimeout(() => {
      openLoginPopup();
    }, 5000);
  }

  // Close popup on close button click
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLoginPopup);
  }

  // Close popup on overlay click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      closeLoginPopup();
    }
  });
}

function openLoginPopup() {
  const popup = document.getElementById('login-popup');
  if (!popup) return;
  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden', 'false');
}

function closeLoginPopup() {
  const popup = document.getElementById('login-popup');
  if (!popup) return;
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
}

// Google Sign-In callback (needs to be global for Google's library)
window.handleGoogleSignIn = function(response) {
  try {
    // Decode the JWT token to get user info
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    setUser(user);
    closeLoginPopup();
    showToast('Welcome, ' + user.name + '!');
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed. Please try again.');
  }
};

  function initHomePage() {
    const trending = (window.PRODUCTS || []).filter((p) => p.trending);
    const classic = (window.PRODUCTS || []).filter((p) => p.signature);
    renderProducts(trending, 'trending-grid');
    renderProducts(classic, 'classic-grid');
  }

  function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    if (!grid) return;

    const wishlistIds = Array.from(wishlist);
    const products = (window.PRODUCTS || []).filter(p => wishlistIds.includes(p.id));
    if (products.length === 0) {
      grid.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 3rem;">Your wishlist is empty</p>';
      return;
    }
    renderProducts(products, 'wishlist-grid');
  }

  // Expose to window for use in other pages
    window.cart = cart;
    window.wishlist = wishlist;
    window.addToCart = addToCart;
    window.toggleWishlist = toggleWishlist;
    window.showToast = showToast;
    window.loadProducts = loadProducts;
    window.saveProducts = saveProducts;
    window.renderWishlist = renderWishlist;
    window.updateWishlistBadge = updateWishlistBadge;
    window.renderCart = renderCart;
    window.renderCheckoutSummary = renderCheckoutSummary;
    window.updateCartItemQty = updateCartItemQty;
    window.removeFromCart = removeFromCart;
    window.placeOrder = placeOrder;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
