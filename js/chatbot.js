// AR Perfumes - Virtual Fragrance Consultant & Smart Chatbot ("Aura")
class FragranceChatbot {
  constructor() {
    this.isOpen = false;
    this.hasGreeted = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.setupListeners();
    this.initGreeting();
  }

  setupListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const inputField = document.getElementById('chatbot-input-field');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleChat());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChat());
    }

    if (sendBtn && inputField) {
      sendBtn.addEventListener('click', () => this.handleUserSend());
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleUserSend();
        }
      });
    }

    // Quick suggestion chips
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-suggestion-chip');
      if (chip) {
        const query = chip.getAttribute('data-query') || chip.textContent.trim();
        this.sendUserMessage(query);
      }
    });
  }

  initGreeting() {
    setTimeout(() => {
      if (!this.hasGreeted) {
        this.addBotMessage(`Assalam-o-Alaikum & Welcome to **AR Perfumes**! 👑\n\nI am **Aura**, your Royal Fragrance Consultant. How may I assist you today?`, [
          "🌟 Recommend Best Sellers",
          "⏱ Longest Lasting Perfumes",
          "📍 Lahore Shop Location",
          "🚚 Delivery & Cash on Delivery",
          "💬 WhatsApp Master Perfumer"
        ]);
        this.hasGreeted = true;
      }
    }, 1500);
  }

  toggleChat() {
    this.isOpen ? this.closeChat() : this.openChat();
  }

  openChat() {
    const widget = document.getElementById('chatbot-widget-container');
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const badge = document.querySelector('.chat-notification-dot');

    if (widget) {
      widget.classList.add('active');
      this.isOpen = true;
      if (toggleBtn) toggleBtn.classList.add('chat-open');
      if (badge) badge.style.display = 'none';

      // Scroll to bottom
      this.scrollToBottom();
      
      const input = document.getElementById('chatbot-input-field');
      if (input) setTimeout(() => input.focus(), 300);
    }
  }

  closeChat() {
    const widget = document.getElementById('chatbot-widget-container');
    const toggleBtn = document.getElementById('chatbot-toggle-btn');

    if (widget) {
      widget.classList.remove('active');
      this.isOpen = false;
      if (toggleBtn) toggleBtn.classList.remove('chat-open');
    }
  }

  handleUserSend() {
    const input = document.getElementById('chatbot-input-field');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    this.sendUserMessage(text);
  }

  sendUserMessage(text) {
    this.addUserMessage(text);
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.generateResponse(text);
      this.addBotMessage(response.text, response.suggestions, response.productCard);
    }, 850);
  }

  addUserMessage(text) {
    const container = document.getElementById('chatbot-messages-list');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'chat-bubble-row user-bubble-row';
    msgEl.innerHTML = `
      <div class="chat-bubble user-bubble">
        <p>${this.escapeHtml(text)}</p>
        <span class="chat-timestamp">${this.getCurrentTime()}</span>
      </div>
    `;

    container.appendChild(msgEl);
    this.scrollToBottom();
  }

  addBotMessage(text, suggestions = [], productCard = null) {
    const container = document.getElementById('chatbot-messages-list');
    if (!container) return;

    const msgEl = document.createElement('div');
    msgEl.className = 'chat-bubble-row bot-bubble-row';

    let formattedText = this.formatMarkdown(text);
    let cardHtml = '';

    if (productCard) {
      cardHtml = `
        <div class="chat-product-preview-card">
          <img src="${productCard.image}" alt="${productCard.name}" />
          <div class="chat-card-body">
            <h5>${productCard.name}</h5>
            <span class="chat-card-price">Rs. ${productCard.price.toLocaleString()}</span>
            <button class="chat-card-add-btn" onclick="window.cartInstance.addItem('${productCard.id}', 1)">
              + Add to Cart
            </button>
          </div>
        </div>
      `;
    }

    let suggestionsHtml = '';
    if (suggestions && suggestions.length > 0) {
      suggestionsHtml = `
        <div class="chat-suggestions-wrap">
          ${suggestions.map(s => `<button class="chat-suggestion-chip" data-query="${s}">${s}</button>`).join('')}
        </div>
      `;
    }

    msgEl.innerHTML = `
      <div class="bot-avatar-gold">👑</div>
      <div class="chat-bubble bot-bubble">
        <div class="bot-text-content">${formattedText}</div>
        ${cardHtml}
        <span class="chat-timestamp">${this.getCurrentTime()}</span>
        ${suggestionsHtml}
      </div>
    `;

    container.appendChild(msgEl);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const container = document.getElementById('chatbot-messages-list');
    if (!container) return;

    let typingEl = document.getElementById('chat-typing-indicator');
    if (!typingEl) {
      typingEl = document.createElement('div');
      typingEl.id = 'chat-typing-indicator';
      typingEl.className = 'chat-bubble-row bot-bubble-row typing-row';
      typingEl.innerHTML = `
        <div class="bot-avatar-gold">👑</div>
        <div class="chat-bubble bot-bubble typing-bubble">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      `;
      container.appendChild(typingEl);
    }
    typingEl.style.display = 'flex';
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingEl = document.getElementById('chat-typing-indicator');
    if (typingEl) {
      typingEl.style.display = 'none';
    }
  }

  generateResponse(query) {
    const q = query.toLowerCase();

    // Store location query
    if (q.includes('location') || q.includes('shop') || q.includes('store') || q.includes('address') || q.includes('ichra') || q.includes('where')) {
      return {
        text: `📍 **AR Perfumes Physical Store Location:**\n\n🏛 **Main Ichra Bazar, Lahore, Pakistan**\n⏰ **Timings:** Monday - Sunday (11:00 AM – 11:00 PM)\n📞 **Helpline:** 03088367974\n\nYou are most welcome to visit our boutique for complimentary fragrance sampling on test strips!`,
        suggestions: ["📞 Call 03088367974", "🚚 Delivery options", "🌟 View Catalog"]
      };
    }

    // Best Seller / Recommendations
    if (q.includes('best') || q.includes('recommend') || q.includes('popular') || q.includes('top seller') || q.includes('fav')) {
      const p = window.PRODUCTS_DATA.find(x => x.id === 'arp-001') || window.PRODUCTS_DATA[0];
      return {
        text: `✨ Our supreme masterpiece is **${p.name}** (${p.arabicName})!\n\n👑 *${p.tagline}*\n• **Longevity:** ${p.longevity}\n• **Concentration:** ${p.concentration}\n• **Key Notes:** Saffron, Cambodian Oud, Taif Rose & Amber.\n\nWould you like to try this royal signature?`,
        productCard: p,
        suggestions: ["More Unisex Perfumes", "View Attar Oils", "Order on WhatsApp"]
      };
    }

    // Long lasting
    if (q.includes('lasting') || q.includes('longevity') || q.includes('stay') || q.includes('hours') || q.includes('projection')) {
      const p = window.PRODUCTS_DATA.find(x => x.id === 'arp-007') || window.PRODUCTS_DATA[0];
      return {
        text: `⏱ For unrivaled longevity, our **Dehn Al Oud Hindi** and **Royal Oud Al-Malaki** last **24 to 48+ hours** on clothes!\n\nWe use **35%+ pure concentrated fragrance oils** sourced directly from Grasse (France) and Assam (India), delivering extraordinary sillage.`,
        productCard: p,
        suggestions: ["View Dehn Al Oud", "Velvet Noir", "Add to Cart"]
      };
    }

    // Oud
    if (q.includes('oud') || q.includes('wood') || q.includes('agarwood')) {
      const p = window.PRODUCTS_DATA.find(x => x.category === 'oud') || window.PRODUCTS_DATA[0];
      return {
        text: `🪵 **Oud Collection at AR Perfumes:**\nWe specialize in authentic agarwood blends ranging from sweet royal saffron ouds to deep smoked Hindi dehn-al-oud. Check out **${p.name}**!`,
        productCard: p,
        suggestions: ["Royal Oud Al-Malaki", "Dehn Al Oud Hindi", "Mukhallat AR Royal"]
      };
    }

    // Attar / Non Alcoholic / Oils
    if (q.includes('attar') || q.includes('oil') || q.includes('itr') || q.includes('alcohol free') || q.includes('namaz')) {
      const p = window.PRODUCTS_DATA.find(x => x.category === 'attar') || window.PRODUCTS_DATA[6];
      return {
        text: `🕌 **100% Pure Non-Alcoholic Attar Oils:**\nOur pure concentrated perfume oils are 100% alcohol-free, ideal for prayers/Namaz and long ceremonial days.`,
        productCard: p,
        suggestions: ["Dehn Al Oud Hindi", "Mukhallat AR Royal", "Imperial White Musk"]
      };
    }

    // Rose / Floral / Women
    if (q.includes('rose') || q.includes('flower') || q.includes('floral') || q.includes('women') || q.includes('girl') || q.includes('lady')) {
      const p = window.PRODUCTS_DATA.find(x => x.id === 'arp-005');
      return {
        text: `🌸 **Aura Rose Sublime** is a breathtaking French floral with fresh Turkish peonies, Damascus roses, sweet lychee, and glowing amber.`,
        productCard: p,
        suggestions: ["Order Aura Rose", "Imperial White Musk", "Contact on WhatsApp"]
      };
    }

    // Fresh / Summer / Aquatic
    if (q.includes('fresh') || q.includes('summer') || q.includes('citrus') || q.includes('aquatic') || q.includes('sport') || q.includes('gym')) {
      const p = window.PRODUCTS_DATA.find(x => x.id === 'arp-006');
      return {
        text: `🌊 **Aquatic Mirage** delivers pure ocean freshness with Calabrian bergamot, sea breeze accords, and mineral ambergris. Perfect for hot summer days!`,
        productCard: p,
        suggestions: ["Add Aquatic Mirage", "Imperial White Musk", "View All"]
      };
    }

    // Delivery / Payment / COD
    if (q.includes('delivery') || q.includes('shipping') || q.includes('cash on delivery') || q.includes('cod') || q.includes('charges')) {
      return {
        text: `🚚 **Shipping & Delivery Details:**\n\n• **Lahore:** Same-day or Next-day Express Delivery (Only Rs. 150, or **FREE on orders above Rs. 4,000**).\n• **Countrywide Pakistan:** 2-3 working days via TCS / Leopard with Cash on Delivery (COD).\n• **Store Pickup:** Free collection from Main Ichra Bazar Lahore.`,
        suggestions: ["Order on WhatsApp", "Payment Methods", "Apply Promo Code"]
      };
    }

    // Discount / Promo code / Price
    if (q.includes('discount') || q.includes('promo') || q.includes('coupon') || q.includes('offer') || q.includes('price')) {
      return {
        text: `🎁 **Special Royal Offer!**\nUse promo code **\`ROYAL10\`** in your cart for an instant **10% OFF** your entire order!\n\nFor orders above Rs. 10,000, enjoy **15% OFF** with code **\`LUXURY15\`**!`,
        suggestions: ["Open Cart", "View All Fragrances", "Chat on WhatsApp"]
      };
    }

    // Contact / WhatsApp / Phone
    if (q.includes('whatsapp') || q.includes('call') || q.includes('number') || q.includes('contact') || q.includes('phone')) {
      return {
        text: `📞 You can chat with our Master Perfumer or place custom orders directly on WhatsApp at **03088367974** (+923088367974).\n\nClick below to start an instant WhatsApp conversation!`,
        suggestions: ["👉 Open WhatsApp Chat", "Store Location", "View Catalog"]
      };
    }

    // Default Fallback
    return {
      text: `I'd love to help you find your signature scent! You can ask me about our **Oud blends, French florals, Pure Attars, Long-lasting notes**, or visit us at **Main Ichra Bazar Lahore**.\n\nCall/WhatsApp us anytime at **03088367974**.`,
      suggestions: ["🌟 Best Sellers", "🪵 Oud & Woods", "🕌 Pure Attars", "📍 Shop Location", "💬 WhatsApp Chat"]
    };
  }

  formatMarkdown(str) {
    let s = this.escapeHtml(str);
    // Bold **text**
    s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code `code`
    s = s.replace(/`(.*?)`/g, '<code>$1</code>');
    // New lines
    s = s.replace(/\n/g, '<br/>');
    return s;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom() {
    const container = document.getElementById('chatbot-messages-list');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.chatbotInstance = new FragranceChatbot();
});
