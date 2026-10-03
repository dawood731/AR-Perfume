// AR Perfumes - Main Application Logic & Micro-interactions
document.addEventListener('DOMContentLoaded', () => {
  initParticlesCanvas();
  initHeaderScroll();
  initMobileMenu();
  renderProductsCatalog('all');
  initCategoryFilters();
  initQuickViewModal();
  initContactForm();
  initSmoothScroll();
  initSearch();
});

// 1. Interactive Ambient Gold Particle Canvas in Hero
function initParticlesCanvas() {
  const canvas = document.getElementById('hero-particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  const particles = [];
  const particleCount = Math.min(65, Math.floor(window.innerWidth / 20));

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.6,
      color: Math.random() > 0.4 ? 'rgba(212, 175, 55, ' : 'rgba(243, 229, 171, ',
      alpha: Math.random() * 0.7 + 0.2,
      speedX: (Math.random() - 0.5) * 0.45,
      speedY: -(Math.random() * 0.5 + 0.2),
      pulsate: Math.random() * 0.02
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.alpha += Math.sin(Date.now() * p.pulsate) * 0.005;

      if (p.y < 0) {
        p.y = height + 5;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.max(0.1, Math.min(0.9, p.alpha))})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// 2. Header Scroll Glassmorphism & Active Link Indicator
function initHeaderScroll() {
  const header = document.getElementById('luxury-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navLink) navLink.classList.add('active');
      } else {
        if (navLink) navLink.classList.remove('active');
      }
    });
  });
}

// 3. Mobile Navigation Drawer
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('luxury-nav-menu');
  const closeBtn = document.getElementById('mobile-nav-close');
  const navLinks = document.querySelectorAll('.nav-link');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      toggleBtn.classList.toggle('active');
    });
  }

  if (closeBtn && navMenu) {
    closeBtn.addEventListener('click', () => {
      navMenu.classList.remove('active');
      if (toggleBtn) toggleBtn.classList.remove('active');
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) navMenu.classList.remove('active');
      if (toggleBtn) toggleBtn.classList.remove('active');
    });
  });
}

// 4. Render Product Catalog
function renderProductsCatalog(category = 'all', searchQuery = '') {
  const grid = document.getElementById('products-grid-container');
  if (!grid) return;

  let filtered = window.PRODUCTS_DATA || [];

  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.tagline.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.notes.top.some(n => n.toLowerCase().includes(q)) ||
      p.notes.heart.some(n => n.toLowerCase().includes(q)) ||
      p.notes.base.some(n => n.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-products-found">
        <span class="no-prod-icon">⚜</span>
        <h3>No Fragrances Match Your Search</h3>
        <p>Try searching for notes like "Oud", "Rose", "Musk", or select "All Fragrances".</p>
        <button class="gold-btn-outline" onclick="renderProductsCatalog('all')">View Full Collection</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    return `
      <div class="product-card" data-category="${product.category}">
        <div class="product-badge-wrap">
          ${product.badge ? `<span class="gold-badge">${product.badge}</span>` : ''}
          <span class="gender-badge">${product.gender}</span>
        </div>

        <div class="product-image-container" onclick="openQuickViewModal('${product.id}')">
          <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
          <div class="product-image-overlay">
            <button class="quick-view-action-btn" title="Quick View">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Quick Details
            </button>
          </div>
        </div>

        <div class="product-details">
          <div class="product-rating-row">
            <div class="stars-gold">
              ★★★★★ <span class="rating-num">${product.rating}</span>
            </div>
            <span class="reviews-count">(${product.reviewsCount})</span>
          </div>

          <span class="product-arabic-title">${product.arabicName || ''}</span>
          <h3 class="product-title" onclick="openQuickViewModal('${product.id}')">${product.name}</h3>
          <p class="product-tagline">${product.tagline}</p>

          <div class="product-notes-chips">
            <span class="note-chip">${product.notes.top[0]}</span>
            <span class="note-chip">${product.notes.heart[0]}</span>
            <span class="note-chip">${product.notes.base[0]}</span>
          </div>

          <div class="product-card-footer">
            <div class="product-price-box">
              <span class="price-current">Rs. ${product.price.toLocaleString()}</span>
              ${product.originalPrice ? `<span class="price-original">Rs. ${product.originalPrice.toLocaleString()}</span>` : ''}
            </div>

            <div class="product-actions-btn-group">
              <button class="add-to-cart-btn" onclick="window.cartInstance.addItem('${product.id}', 1)" title="Add to Cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <span>Add</span>
              </button>
              
              <button class="direct-wa-btn" onclick="orderSingleItemWhatsApp('${product.id}')" title="Buy Directly on WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 5. Category Filters
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.category-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');
      renderProductsCatalog(cat);
    });
  });
}

// 6. Search functionality
function initSearch() {
  const searchInput = document.getElementById('catalog-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    const activeTab = document.querySelector('.category-tab-btn.active');
    const cat = activeTab ? activeTab.getAttribute('data-category') : 'all';
    renderProductsCatalog(cat, val);
  });
}

// 7. Quick View Modal
function initQuickViewModal() {
  const modal = document.getElementById('quick-view-modal');
  const closeBtn = document.getElementById('close-quick-view-btn');
  const overlay = document.getElementById('modal-backdrop-overlay');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => closeModal());
  }
  if (overlay && modal) {
    overlay.addEventListener('click', () => closeModal());
  }

  function closeModal() {
    modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.closeQuickViewModal = closeModal;
}

function openQuickViewModal(productId) {
  const product = window.PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const modalBody = document.getElementById('quick-view-modal-content');
  const overlay = document.getElementById('modal-backdrop-overlay');

  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="qv-grid">
      <div class="qv-media">
        <div class="qv-img-wrap">
          <img src="${product.image}" alt="${product.name}" />
          ${product.badge ? `<span class="qv-badge">${product.badge}</span>` : ''}
        </div>
      </div>

      <div class="qv-details">
        <div class="qv-header">
          <span class="qv-arabic">${product.arabicName || ''}</span>
          <h2 class="qv-title">${product.name}</h2>
          <p class="qv-tagline">${product.tagline}</p>
          <div class="qv-price-row">
            <span class="qv-price">Rs. ${product.price.toLocaleString()}</span>
            ${product.originalPrice ? `<span class="qv-orig-price">Rs. ${product.originalPrice.toLocaleString()}</span>` : ''}
            <span class="qv-size-badge">${product.size}</span>
          </div>
        </div>

        <p class="qv-description">${product.description}</p>

        <!-- Fragrance Pyramid -->
        <div class="fragrance-pyramid-card">
          <h4 class="pyramid-title">⚜ Olfactory Notes Breakdown</h4>
          
          <div class="pyramid-level top-notes">
            <span class="level-label">✦ Top Notes (First 30 Mins):</span>
            <div class="notes-tags">${product.notes.top.map(n => `<span>${n}</span>`).join('')}</div>
          </div>

          <div class="pyramid-level heart-notes">
            <span class="level-label">✦ Heart Notes (2 - 6 Hours):</span>
            <div class="notes-tags">${product.notes.heart.map(n => `<span>${n}</span>`).join('')}</div>
          </div>

          <div class="pyramid-level base-notes">
            <span class="level-label">✦ Base Notes (Deep Drydown 24h+):</span>
            <div class="notes-tags">${product.notes.base.map(n => `<span>${n}</span>`).join('')}</div>
          </div>
        </div>

        <div class="qv-specs-grid">
          <div class="qv-spec-item">
            <span class="spec-name">Concentration</span>
            <span class="spec-value">${product.concentration}</span>
          </div>
          <div class="qv-spec-item">
            <span class="spec-name">Longevity</span>
            <span class="spec-value">${product.longevity}</span>
          </div>
          <div class="qv-spec-item">
            <span class="spec-name">Sillage / Projection</span>
            <span class="spec-value">${product.sillage}</span>
          </div>
          <div class="qv-spec-item">
            <span class="spec-name">Gender Suitability</span>
            <span class="spec-value">${product.gender}</span>
          </div>
        </div>

        <div class="qv-actions-row">
          <div class="qv-qty-selector">
            <button onclick="changeQvQty(-1)">-</button>
            <span id="qv-selected-qty">1</span>
            <button onclick="changeQvQty(1)">+</button>
          </div>

          <button class="gold-btn qv-add-btn" onclick="addFromModal('${product.id}')">
            <span>Add to Royal Bag</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>

          <button class="wa-btn qv-wa-btn" onclick="orderSingleItemWhatsApp('${product.id}')">
            <span>WhatsApp Order</span>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.openQuickViewModal = openQuickViewModal;

window.changeQvQty = function(delta) {
  const qtyEl = document.getElementById('qv-selected-qty');
  if (!qtyEl) return;
  let current = parseInt(qtyEl.textContent) || 1;
  current = Math.max(1, current + delta);
  qtyEl.textContent = current;
};

window.addFromModal = function(productId) {
  const qtyEl = document.getElementById('qv-selected-qty');
  const qty = qtyEl ? (parseInt(qtyEl.textContent) || 1) : 1;
  window.cartInstance.addItem(productId, qty);
  window.closeQuickViewModal();
};

window.orderSingleItemWhatsApp = function(productId) {
  const product = window.PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const msg = `*👑 AR PERFUMES - DIRECT INQUIRY / ORDER 👑*\n\n` +
    `Hello AR Perfumes, I would like to order / inquire about:\n` +
    `• *Fragrance:* ${product.name} (${product.arabicName || ''})\n` +
    `• *Size:* ${product.size}\n` +
    `• *Price:* Rs. ${product.price.toLocaleString()}\n` +
    `• *Concentration:* ${product.concentration}\n\n` +
    `Please share the delivery details for Lahore / Pakistan. Thank you!`;

  const url = `https://wa.me/923088367974?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};

// 8. Contact Form
function initContactForm() {
  const form = document.getElementById('luxury-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name')?.value || 'Valued Customer';
    const phone = document.getElementById('contact-phone')?.value || 'Not provided';
    const message = document.getElementById('contact-message')?.value || '';

    const text = `*👑 AR PERFUMES - WEBSITE CONTACT MESSAGE 👑*\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Message:* ${message}\n\n` +
      `Sent via AR Perfumes Official Website`;

    const url = `https://wa.me/923088367974?text=${encodeURIComponent(text)}`;

    if (window.cartInstance) {
      window.cartInstance.showToast("⚜ Thank you! Redirecting your message to our Master Perfumer on WhatsApp...");
    }

    setTimeout(() => {
      window.open(url, '_blank');
      form.reset();
    }, 1000);
  });
}

// 9. Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
