(() => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".site-nav a");
  const form = document.querySelector(".contact-form");
  const statusMessage = document.querySelector(".form-status");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".product-card");
  const categoryCards = document.querySelectorAll(".category-card");
  const revealItems = document.querySelectorAll(
    ".section-heading, .intro > *, .metrics-strip article, .product-card, .story > *, .process-grid article, .contact > *",
  );
  const cartCountElement = document.querySelector(".cart-count");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const cartPreview = document.getElementById("cart-added-preview");
  const previewItems = document.getElementById("preview-items");
  const previewCount = document.getElementById("preview-items-count");
  const previewTotal = document.getElementById("preview-cart-total");
  const previewClose = document.querySelector(".preview-close");
  let previewTimeout;

  const whatsappNumber = "580000000000";
  const storageKey = "kafeCart";

  function readCartStorage() {
    try {
      const storedName = JSON.parse(window.name || "{}")[storageKey];
      const raw =
        localStorage.getItem(storageKey) ||
        sessionStorage.getItem(storageKey) ||
        storedName ||
        "[]";
      return JSON.parse(raw);
    } catch (e) {
      try {
        return JSON.parse(sessionStorage.getItem(storageKey) || "[]");
      } catch (err) {
        try {
          return JSON.parse(
            JSON.parse(window.name || "{}")[storageKey] || "[]",
          );
        } catch (finalErr) {
          return [];
        }
      }
    }
  }

  function saveCartToStorage(cartData) {
    const payload = JSON.stringify(cartData);

    try {
      localStorage.setItem(storageKey, payload);
    } catch (e) {
      try {
        sessionStorage.setItem(storageKey, payload);
      } catch (err) {
        const current = JSON.parse(window.name || "{}") || {};
        window.name = JSON.stringify({ ...current, [storageKey]: payload });
      }
    }
  }

  async function syncCartToServer(cartData) {
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartData }),
      });
    } catch (_error) {
      // No interrumpe la app si el servidor no está disponible.
    }
  }

  async function loadCartFromServer() {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) return;
      const serverCart = await response.json();
      if (Array.isArray(serverCart)) {
        cart = serverCart;
        saveCartToStorage(cart);
        updateCartCount();
      }
    } catch (_error) {
      // Ignorar cuando no hay servidor.
    }
  }

  let cart = readCartStorage();

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  }

  function closeMenu() {
    header.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function saveCart() {
    saveCartToStorage(cart);
    syncCartToServer(cart);
  }

  function hideCartPreview() {
    if (!cartPreview) return;
    cartPreview.classList.remove("is-visible");
    clearTimeout(previewTimeout);
  }

  function showCartPreview() {
    if (!cartPreview || !previewItems || !previewCount) return;

    previewItems.innerHTML = cart
      .map(
        (item) => `
      <div class="preview-item">
        <div>
          <strong>${item.name}</strong>
          <span>${item.quantity} × Bs ${formatPrice(item.price)}</span>
        </div>
        <strong>Bs ${formatPrice(item.price * item.quantity)}</strong>
      </div>
    `,
      )
      .join("");

    previewCount.textContent = `${cart.length} producto${cart.length === 1 ? "" : "s"} · ${getCartQuantity()} unidades`;
    previewTotal.textContent = `Total carrito: Bs ${formatPrice(getCartTotal())}`;

    cartPreview.classList.add("is-visible");
    clearTimeout(previewTimeout);
    previewTimeout = window.setTimeout(hideCartPreview, 4200);
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat("es-VE").format(amount);
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getCartQuantity() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateCartCount() {
    const items = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = items;
    });
  }

  function addToCart(product) {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();
    window.dispatchEvent(new CustomEvent("kafe-cart-updated"));
    showCartPreview();
  }

  window.addEventListener("storage", () => {
    cart = readCartStorage();
    updateCartCount();
  });

  window.addEventListener("kafe-cart-updated", () => {
    cart = readCartStorage();
    updateCartCount();
  });

  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      productCards.forEach((card) => {
        const categoryMatch = card.dataset.category === filter;
        const classificationMatch = card.dataset.classification === filter;
        const shouldShow =
          filter === "todos" || categoryMatch || classificationMatch;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });

  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const filter = card.dataset.filter;
      const targetButton = Array.from(filterButtons).find(
        (button) => button.dataset.filter === filter,
      );

      if (targetButton) {
        targetButton.click();
      }

      const catalogSection = document.querySelector("#catalogo");
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: Number(card.dataset.price),
        category: card.dataset.category || "otros",
        classification: card.dataset.classification || "",
        brand: card.dataset.brand || "Kafé C.A.",
        producer: card.dataset.producer || "Productores Andinos",
        image: card.querySelector("img")?.src || "",
      };

      addToCart(product);
    });
  });

  if (previewClose) {
    previewClose.addEventListener("click", hideCartPreview);
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const nombre = formData.get("nombre");
      const negocio = formData.get("negocio") || "No indicado";
      const producto = formData.get("producto");
      const cantidad = formData.get("cantidad");
      const telefono = formData.get("telefono");
      const mensaje = formData.get("mensaje");

      const text = [
        "Hola, quiero cotizar café Kafé.",
        `Nombre: ${nombre}`,
        `Negocio: ${negocio}`,
        `Producto: ${producto}`,
        `Cantidad estimada: ${cantidad}`,
        `WhatsApp: ${telefono}`,
        `Mensaje: ${mensaje}`,
      ].join("\n");

      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

      if (statusMessage) {
        statusMessage.innerHTML = `Mensaje preparado. <a href="${url}" target="_blank" rel="noopener">Abrir WhatsApp</a>`;
      }
      form.reset();
    });
  }

  window.addEventListener("scroll", updateHeader, { passive: true });

  if ("IntersectionObserver" in window) {
    revealItems.forEach((item) => item.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  updateCartCount();
  updateHeader();
  loadCartFromServer();
})();
