(() => {
  const storageKey = "kafeCart";
  const cartItemsList = document.getElementById("cart-items-list");
  const cartEmptyState = document.getElementById("cart-empty-state");
  const cartCount = document.getElementById("cart-count");
  const cartSubtotal = document.getElementById("cart-subtotal");
  const checkoutButton = document.getElementById("cart-checkout");
  const clearButton = document.getElementById("cart-clear");
  const drawerPanel = document.getElementById("cart-summary-drawer");
  const drawerCount = document.getElementById("drawer-count");
  const drawerList = document.getElementById("drawer-list");
  const drawerTotal = document.getElementById("drawer-total");
  const drawerClose = document.querySelector(".drawer-close");
  const drawerCheckoutButton = document.querySelector(".drawer-checkout");
  const drawerClearButton = document.querySelector(".drawer-clear");

  const whatsappNumber = "580000000000";
  async function readCartStorage() {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const cart = await response.json();
        if (Array.isArray(cart)) return cart;
      }
    } catch (_error) {
      // No interrumpe si el servidor no está disponible.
    }

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
      // No interrumpe si el servidor no está disponible.
    }
  }

  let cart = [];

  function formatPrice(amount) {
    return new Intl.NumberFormat("es-VE").format(amount);
  }

  async function saveCart() {
    saveCartToStorage(cart);
    await syncCartToServer(cart);
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getCartQuantity() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateSummary() {
    cartCount.textContent = getCartQuantity();
    cartSubtotal.textContent = `Bs ${formatPrice(getCartTotal())}`;
    checkoutButton.disabled = cart.length === 0;
    clearButton.disabled = cart.length === 0;
  }

  function renderCartDrawer() {
    if (!drawerPanel) return;

    if (cart.length === 0) {
      drawerPanel.classList.remove("is-visible");
      drawerList.innerHTML = "";
      drawerCount.textContent = "0 productos";
      drawerTotal.textContent = "Bs 0";
      return;
    }

    drawerPanel.classList.add("is-visible");
    drawerCount.textContent = `${getCartQuantity()} producto${getCartQuantity() === 1 ? "" : "s"}`;
    drawerTotal.textContent = `Bs ${formatPrice(getCartTotal())}`;
    drawerList.innerHTML = "";

    cart.forEach((item) => {
      const drawerItem = document.createElement("div");
      drawerItem.className = "drawer-item";
      drawerItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="drawer-item-info">
        <strong>${item.name}</strong>
        <span>${item.quantity} × Bs ${formatPrice(item.price)}</span>
      </div>
      <div class="drawer-item-price">Bs ${formatPrice(item.quantity * item.price)}</div>
    `;
      drawerList.appendChild(drawerItem);
    });
  }

  function renderCart() {
    cartItemsList.innerHTML = "";

    if (cart.length === 0) {
      cartEmptyState.style.display = "block";
      updateSummary();
      return;
    }

    cartEmptyState.style.display = "none";

    cart.forEach((item) => {
      const card = document.createElement("article");
      card.className = "cart-card";
      card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-card-meta">
        <strong>${item.name}</strong>
        <p>${item.brand} · ${item.producer}</p>
        <p>Precio unitario: Bs ${formatPrice(item.price)}</p>
        <p>Subtotal: Bs ${formatPrice(item.price * item.quantity)}</p>
        <div class="cart-card-actions">
          <div class="cart-quantity-controls" data-id="${item.id}">
            <button class="qty-decrease" type="button" aria-label="Disminuir cantidad">−</button>
            <span>${item.quantity}</span>
            <button class="qty-increase" type="button" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="cart-remove-button" type="button" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
    `;

      cartItemsList.appendChild(card);
    });

    updateSummary();
    renderCartDrawer();
  }

  async function updateCartFromStorage() {
    cart = await readCartStorage();
    renderCart();
  }

  async function changeQuantity(id, delta) {
    const item = cart.find((product) => product.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((product) => product.id !== id);
    }

    await saveCart();
    renderCart();
  }

  async function removeItem(id) {
    cart = cart.filter((product) => product.id !== id);
    await saveCart();
    renderCart();
  }

  async function clearCart() {
    cart = [];
    await saveCart();
    renderCart();
  }

  function sendCartToWhatsApp() {
    if (cart.length === 0) return;

    const totalItems = getCartQuantity();
    const lines = [
      "Hola, quiero realizar un pedido de café Kafé.",
      `Cantidad de artículos: ${totalItems}`,
      "Detalles del pedido:",
      ...cart.map(
        (item) =>
          `${item.quantity}× ${item.name} — Bs ${formatPrice(item.price * item.quantity)}`,
      ),
      `Total: Bs ${formatPrice(getCartTotal())}`,
    ];

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  }

  window.addEventListener("storage", () => {
    updateCartFromStorage().catch(() => {});
  });
  window.addEventListener("kafe-cart-updated", () => {
    updateCartFromStorage().catch(() => {});
  });

  cartItemsList.addEventListener("click", (event) => {
    const decrease = event.target.closest(".qty-decrease");
    const increase = event.target.closest(".qty-increase");
    const remove = event.target.closest(".cart-remove-button");
    const quantityControl = event.target.closest(".cart-quantity-controls");

    if (decrease && quantityControl) {
      changeQuantity(quantityControl.dataset.id, -1);
    }

    if (increase && quantityControl) {
      changeQuantity(quantityControl.dataset.id, 1);
    }

    if (remove) {
      removeItem(remove.dataset.id);
    }
  });

  function goToCheckout() {
    window.location.href = "checkout.html";
  }

  checkoutButton.addEventListener("click", goToCheckout);
  clearButton.addEventListener("click", clearCart);

  if (drawerCheckoutButton) {
    drawerCheckoutButton.addEventListener("click", goToCheckout);
  }

  if (drawerClearButton) {
    drawerClearButton.addEventListener("click", clearCart);
  }

  if (drawerClose) {
    drawerClose.addEventListener("click", () => {
      if (drawerPanel) {
        drawerPanel.classList.remove("is-visible");
      }
    });
  }

  (async function initCart() {
    cart = await readCartStorage();
    renderCart();
  })();
})();
