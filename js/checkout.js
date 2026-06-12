const storageKey = "kafeCart";
const checkoutInfoKey = "kafeCheckoutInfo";
const paymentGatewayUrl = "pasarela.html";
const whatsappNumber = "580000000000";

const paymentLabels = {
  tarjeta: "Continuar a pasarela de pago",
  movil: "Generar datos de pago móvil",
  transferencia: "Generar datos de transferencia",
};

function formatPrice(amount) {
  return new Intl.NumberFormat("es-VE").format(amount);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) || fallback;
  } catch (_error) {
    return fallback;
  }
}

function getCart() {
  return safeJsonParse(localStorage.getItem(storageKey), []);
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartQuantity(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getOrderCode() {
  const stored = sessionStorage.getItem("kafeOrderCode");
  if (stored) return stored;

  const code = `ORDER-${Date.now().toString().slice(-8)}`;
  sessionStorage.setItem("kafeOrderCode", code);
  return code;
}

function renderCheckoutItems() {
  const container = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const countEl = document.getElementById("checkout-count");
  const submitButton = document.getElementById("checkout-submit");
  const cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="checkout-empty-state">
        <strong>Tu carrito está vacío</strong>
        <span>Agrega productos antes de finalizar la compra.</span>
        <a class="btn btn-primary" href="tienda.html">Ir a la tienda</a>
      </div>
    `;
    if (submitButton) submitButton.disabled = true;
  } else {
    container.innerHTML = cart
      .map(
        (item) => `
        <div class="checkout-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <strong>${item.name}</strong>
            <span>${item.brand || "Kafé C.A."} · ${item.quantity} × Bs ${formatPrice(item.price)}</span>
          </div>
          <strong>Bs ${formatPrice(item.price * item.quantity)}</strong>
        </div>
      `,
      )
      .join("");
    if (submitButton) submitButton.disabled = false;
  }

  if (countEl) countEl.textContent = getCartQuantity(cart);
  if (totalEl) totalEl.textContent = `Bs ${formatPrice(getCartTotal(cart))}`;
}

function updateDeliverySummary() {
  const deliveryEl = document.getElementById("checkout-delivery");
  const delivery = document.querySelector('input[name="entrega"]:checked');
  if (!deliveryEl || !delivery) return;

  deliveryEl.textContent =
    delivery.value === "retiro" ? "Retiro acordado" : "Por coordinar";
}

function updatePaymentButton() {
  const submitButton = document.getElementById("checkout-submit");
  const method = document.querySelector('input[name="pago"]:checked')?.value;
  if (!submitButton || !method) return;
  submitButton.textContent = paymentLabels[method] || paymentLabels.tarjeta;
}

function updateSelectedCards() {
  document.querySelectorAll(".option-card").forEach((card) => {
    const input = card.querySelector("input");
    card.classList.toggle("is-selected", Boolean(input?.checked));
  });
}

function saveCheckoutInfo(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  localStorage.setItem(checkoutInfoKey, JSON.stringify(data));
  return data;
}

function restoreCheckoutInfo(form) {
  const stored = safeJsonParse(localStorage.getItem(checkoutInfoKey), {});

  Object.entries(stored).forEach(([name, value]) => {
    const field = form.elements[name];
    if (!field) return;

    if (field instanceof RadioNodeList) {
      const match = Array.from(field).find((input) => input.value === value);
      if (match) match.checked = true;
      return;
    }

    field.value = value;
  });
}

function setStatus(message) {
  const status = document.getElementById("checkout-status");
  if (status) status.textContent = message;
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(message);
  } catch (_error) {
    setStatus("No se pudo copiar automáticamente. Puedes copiar los datos manualmente.");
  }
}

function getWhatsappUrl(data, cart, amount, orderCode) {
  const lines = [
    "Hola, quiero confirmar mi pedido Kafé.",
    `Orden: ${orderCode}`,
    `Nombre: ${data.nombre}`,
    `WhatsApp: ${data.telefono}`,
    `Entrega: ${data.entrega === "retiro" ? "Retiro acordado" : "Entrega a domicilio"}`,
    `Dirección: ${data.direccion}`,
    `Ciudad: ${data.ciudad}`,
    "Productos:",
    ...cart.map(
      (item) =>
        `${item.quantity}× ${item.name} - Bs ${formatPrice(item.price * item.quantity)}`,
    ),
    `Total: Bs ${formatPrice(amount)}`,
  ];

  if (data.notas) lines.push(`Notas: ${data.notas}`);

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function showPaymentInstructions(method, data, cart, amount) {
  const movilEl = document.getElementById("movil-instructions");
  const transferenciaEl = document.getElementById("transferencia-instructions");
  const orderCode = getOrderCode();
  const whatsappUrl = getWhatsappUrl(data, cart, amount, orderCode);

  if (movilEl) movilEl.classList.add("hidden");
  if (transferenciaEl) transferenciaEl.classList.add("hidden");

  if (method === "movil" && movilEl) {
    const phone = "0412-000-0000";
    movilEl.classList.remove("hidden");
    movilEl.innerHTML = `
      <div class="instruction-card">
        <span class="summary-kicker">Pago móvil</span>
        <h3>Datos para completar el pago</h3>
        <p>Envía Bs ${formatPrice(amount)} y conserva la referencia del banco.</p>
        <dl>
          <div><dt>Banco</dt><dd>Banco Ejemplo</dd></div>
          <div><dt>Teléfono</dt><dd>${phone}</dd></div>
          <div><dt>RIF</dt><dd>J-00000000-0</dd></div>
          <div><dt>Referencia</dt><dd>${orderCode}</dd></div>
        </dl>
        <div class="instruction-actions">
          <button class="btn btn-ghost" id="copy-movil" type="button">Copiar datos</button>
          <a class="btn btn-primary" href="${whatsappUrl}" target="_blank" rel="noopener">Confirmar por WhatsApp</a>
        </div>
      </div>
    `;

    document.getElementById("copy-movil")?.addEventListener("click", () => {
      copyText(
        `Pago móvil Kafé C.A. | Banco Ejemplo | ${phone} | RIF J-00000000-0 | ${orderCode}`,
        "Datos de pago móvil copiados.",
      );
    });
    movilEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (method === "transferencia" && transferenciaEl) {
    const account = "0123-456789-0";
    transferenciaEl.classList.remove("hidden");
    transferenciaEl.innerHTML = `
      <div class="instruction-card">
        <span class="summary-kicker">Transferencia</span>
        <h3>Datos bancarios del pedido</h3>
        <p>Transfiere Bs ${formatPrice(amount)} e indica la orden en el concepto.</p>
        <dl>
          <div><dt>Banco</dt><dd>Banco Ejemplo</dd></div>
          <div><dt>Cuenta</dt><dd>${account}</dd></div>
          <div><dt>Titular</dt><dd>Kafé C.A.</dd></div>
          <div><dt>Orden</dt><dd>${orderCode}</dd></div>
        </dl>
        <div class="instruction-actions">
          <button class="btn btn-ghost" id="copy-transfer" type="button">Copiar datos</button>
          <a class="btn btn-primary" href="${whatsappUrl}" target="_blank" rel="noopener">Confirmar por WhatsApp</a>
        </div>
      </div>
    `;

    document.getElementById("copy-transfer")?.addEventListener("click", () => {
      copyText(
        `Transferencia Kafé C.A. | Banco Ejemplo | Cuenta ${account} | Orden ${orderCode}`,
        "Datos bancarios copiados.",
      );
    });
    transferenciaEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = saveCheckoutInfo(form);
  const cart = getCart();

  if (cart.length === 0) {
    setStatus("El carrito está vacío. Agrega productos antes de continuar.");
    return;
  }

  const amount = getCartTotal(cart);
  const method = data.pago || "tarjeta";

  if (method === "tarjeta") {
    const params = new URLSearchParams({
      amount: String(amount),
      currency: "VES",
      method: "tarjeta",
      order: getOrderCode(),
    });
    window.location.href = `${paymentGatewayUrl}?${params.toString()}`;
    return;
  }

  showPaymentInstructions(method, data, cart, amount);
  setStatus("Datos generados. Revisa el resumen para copiar o confirmar por WhatsApp.");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");

  renderCheckoutItems();
  updateDeliverySummary();
  updatePaymentButton();
  updateSelectedCards();

  if (!form) return;

  restoreCheckoutInfo(form);
  updateDeliverySummary();
  updatePaymentButton();
  updateSelectedCards();

  form.addEventListener("submit", handleSubmit);
  form.addEventListener("change", (event) => {
    if (event.target.matches('input[name="entrega"]')) {
      updateDeliverySummary();
    }

    if (event.target.matches('input[name="pago"]')) {
      updatePaymentButton();
    }

    updateSelectedCards();
  });
});
