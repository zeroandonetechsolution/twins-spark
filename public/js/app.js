(function () {
  'use strict';

  const PARTICLE_COUNT = 3;
  const CART_KEY = 'twins_spark_cart';
  const WISHLIST_KEY = 'twins_spark_wishlist';

  let cart = [];
  let wishlist = new Set();

  // ── Storage ─────────────────────────────────────────────

  function loadCart() {
    try {
      cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function loadWishlist() {
    try {
      wishlist = new Set(JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []);
    } catch {
      wishlist = new Set();
    }
  }

  function saveWishlist() {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]));
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
          const mainImage = (p.images && p.images[0]) || p.image || '';

          return `
      <article class="product-card glass" data-product-id="${p.id}">
        <a href="product.html?id=${p.id}" class="product-link" aria-label="View ${p.name}">
          <div class="product-image-wrap">
            ${
              mainImage
                ? `<img src="${mainImage}" alt="${p.name}" loading="lazy" />`
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
        qty: 1,
        options: options 
      });
    }

    saveCart();
    showToast(`${product.name} added to cart`);
  }
  window.addToCart = addToCart;

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

    if (document.body.dataset.category) {
      initCategoryPage();
    } else if (document.body.classList.contains('page-home')) {
      initHomePage();
    } else if (document.getElementById('product-grid')) {
      renderProducts(window.PRODUCTS || []);
    }
  }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
