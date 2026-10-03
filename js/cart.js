// AR Perfumes - Luxury Cart & Draggable Floating Cart System
class LuxuryCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('ar_perfumes_cart')) || [];
    this.discount = 0;
    this.discountCode = '';
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.renderCartItems();
    this.updateCartBadge();
    this.setupDraggableFloatingCart();
    this.setupCartDrawerListeners();
  }

  save() {
    localStorage.setItem('ar_perfumes_cart', JSON.stringify(this.items));
    this.updateCartBadge();
    this.renderCartItems();
  }

  addItem(productId, quantity = 1) {
    const product = window.PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const existing = this.items.find(item => item.id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        arabicName: product.arabicName,
        price: product.price,
        size: product.size,
        image: product.image,
        concentration: product.concentration,
        quantity: quantity
      });
    }

    this.save();
    this.showToast(`✨ Added "${product.name}" to your Royal Bag!`);
    this.pulseCartIcon();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.save();
    }
  }

  clearCart() {
    this.items = [];
    this.discount = 0;
    this.discountCode = '';
    this.save();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    const discountAmount = subtotal * this.discount;
    return Math.max(0, subtotal - discountAmount);
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateCartBadge() {
    const count = this.getItemCount();
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  pulseCartIcon() {
    const cartFloatingBtn = document.getElementById('floating-cart-btn');
    if (cartFloatingBtn) {
      cartFloatingBtn.classList.add('cart-pulse-glow');
      setTimeout(() => cartFloatingBtn.classList.remove('cart-pulse-glow'), 1200);
    }
  }

  showToast(message) {
    let toast = document.getElementById('luxury-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'luxury-toast';
      toast.className = 'luxury-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-gold-bullet">⚜</span>
        <span class="toast-text">${message}</span>
      </div>
    `;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal-price');
    const totalEl = document.getElementById('cart-total-price');
    const discountRow = document.getElementById('cart-discount-row');
    const discountValEl = document.getElementById('cart-discount-value');
    const emptyState = document.getElementById('cart-empty-state');
    const checkoutBtn = document.getElementById('cart-whatsapp-checkout-btn');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (subtotalEl) subtotalEl.textContent = 'Rs. 0';
      if (totalEl) totalEl.textContent = 'Rs. 0';
      if (discountRow) discountRow.style.display = 'none';
      if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'true');
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (checkoutBtn) checkoutBtn.removeAttribute('disabled');

    container.innerHTML = this.items.map(item => `
      <div class="cart-item-row" data-id="${item.id}">
        <div class="cart-item-img-wrap">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title-row">
            <h4 class="cart-item-name">${item.name}</h4>
            <button class="cart-remove-btn" onclick="window.cartInstance.removeItem('${item.id}')" title="Remove Item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <span class="cart-item-arabic">${item.arabicName || ''}</span>
          <span class="cart-item-size">${item.size}</span>
          <div class="cart-item-bottom">
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="window.cartInstance.updateQuantity('${item.id}', -1)">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn" onclick="window.cartInstance.updateQuantity('${item.id}', 1)">+</button>
            </div>
            <span class="cart-item-price">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `).join('');

    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `Rs. ${total.toLocaleString()}`;

    if (this.discount > 0 && discountRow && discountValEl) {
      discountRow.style.display = 'flex';
      const saving = subtotal * this.discount;
      discountValEl.textContent = `- Rs. ${saving.toLocaleString()} (${this.discountCode})`;
    } else if (discountRow) {
      discountRow.style.display = 'none';
    }
  }

  applyPromoCode(code) {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'ROYAL10' || cleanCode === 'ICHRA10') {
      this.discount = 0.10; // 10% off
      this.discountCode = cleanCode;
      this.renderCartItems();
      this.showToast(`👑 Royal 10% Discount applied!`);
      return { success: true, message: '10% Discount Applied!' };
    } else if (cleanCode === 'LUXURY15' && this.getSubtotal() >= 10000) {
      this.discount = 0.15; // 15% off for 10k+
      this.discountCode = cleanCode;
      this.renderCartItems();
      this.showToast(`👑 Exclusive 15% VIP Discount applied!`);
      return { success: true, message: '15% VIP Discount Applied!' };
    } else {
      return { success: false, message: 'Invalid or expired code. Try "ROYAL10"' };
    }
  }

  setupDraggableFloatingCart() {
    const cartEl = document.getElementById('floating-cart-btn');
    if (!cartEl) return;

    let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
    let hasMoved = false;

    const onMouseDown = (e) => {
      // Prevent drag if click was on inner elements intended for opening
      hasMoved = false;
      e.preventDefault();
      mouseX = e.clientX || (e.touches && e.touches[0].clientX);
      mouseY = e.clientY || (e.touches && e.touches[0].clientY);

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onMouseMove, { passive: false });
      document.addEventListener('touchend', onMouseUp);
    };

    const onMouseMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      const dx = clientX - mouseX;
      const dy = clientY - mouseY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
        cartEl.classList.add('is-dragging');
      }

      posX = cartEl.offsetLeft + dx;
      posY = cartEl.offsetTop + dy;

      // Keep within viewport boundaries
      const maxX = window.innerWidth - cartEl.offsetWidth - 10;
      const maxY = window.innerHeight - cartEl.offsetHeight - 10;
      
      posX = Math.max(10, Math.min(posX, maxX));
      posY = Math.max(10, Math.min(posY, maxY));

      cartEl.style.left = `${posX}px`;
      cartEl.style.top = `${posY}px`;
      cartEl.style.right = 'auto';
      cartEl.style.bottom = 'auto';

      mouseX = clientX;
      mouseY = clientY;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
      
      setTimeout(() => {
        cartEl.classList.remove('is-dragging');
      }, 50);

      // If user simply clicked without dragging, toggle drawer
      if (!hasMoved) {
        this.openDrawer();
      }
    };

    cartEl.addEventListener('mousedown', onMouseDown);
    cartEl.addEventListener('touchstart', onMouseDown, { passive: false });
  }

  setupCartDrawerListeners() {
    const openBtns = document.querySelectorAll('.open-cart-drawer-btn');
    const closeBtn = document.getElementById('close-cart-drawer-btn');
    const overlay = document.getElementById('cart-drawer-overlay');
    const promoBtn = document.getElementById('apply-promo-btn');
    const promoInput = document.getElementById('cart-promo-input');
    const checkoutBtn = document.getElementById('cart-whatsapp-checkout-btn');

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDrawer());
    }
    if (overlay) {
      overlay.addEventListener('click', () => this.closeDrawer());
    }

    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const res = this.applyPromoCode(promoInput.value);
        const msgEl = document.getElementById('promo-status-msg');
        if (msgEl) {
          msgEl.textContent = res.message;
          msgEl.className = res.success ? 'promo-msg success' : 'promo-msg error';
        }
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.checkoutViaWhatsApp());
    }
  }

  openDrawer() {
    const drawer = document.getElementById('luxury-cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
      this.renderCartItems();
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeDrawer() {
    const drawer = document.getElementById('luxury-cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  checkoutViaWhatsApp() {
    if (this.items.length === 0) {
      this.showToast("Your royal bag is empty!");
      return;
    }

    const customerName = document.getElementById('checkout-cust-name')?.value.trim() || 'Valued Client';
    const customerCity = document.getElementById('checkout-cust-city')?.value.trim() || 'Lahore';
    const customerAddress = document.getElementById('checkout-cust-address')?.value.trim() || 'Store Pick / Cash on Delivery';

    let orderText = `*👑 AR PERFUMES - NEW LUXURY ORDER 👑*\n`;
    orderText += `--------------------------------------\n`;
    orderText += `*Customer:* ${customerName}\n`;
    orderText += `*City/Area:* ${customerCity}\n`;
    orderText += `*Address:* ${customerAddress}\n`;
    orderText += `--------------------------------------\n`;
    orderText += `*SELECTED FRAGRANCES:*\n`;

    this.items.forEach((item, idx) => {
      orderText += `${idx + 1}. *${item.name}* (${item.size})\n`;
      orderText += `   Quantity: ${item.quantity} x Rs. ${item.price.toLocaleString()} = Rs. ${(item.price * item.quantity).toLocaleString()}\n`;
    });

    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    orderText += `--------------------------------------\n`;
    orderText += `*Subtotal:* Rs. ${subtotal.toLocaleString()}\n`;
    if (this.discount > 0) {
      orderText += `*Discount (${this.discountCode}):* - Rs. ${(subtotal * this.discount).toLocaleString()}\n`;
    }
    orderText += `*Total Order Value:* *Rs. ${total.toLocaleString()}*\n`;
    orderText += `*Delivery:* Cash on Delivery / Lahore Store Pickup\n`;
    orderText += `--------------------------------------\n`;
    orderText += `*Shop Location:* Main Ichra Bazar Lahore\n`;
    orderText += `*Official Line:* 03088367974\n\n`;
    orderText += `Please confirm my order dispatch and tracking details. Thank you!`;

    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/923088367974?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cartInstance = new LuxuryCart();
});
