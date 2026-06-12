const storageKey = "kafeCart";
const checkoutInfoKey = "kafeCheckoutInfo";

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

function getCheckoutInfo() {
  return safeJsonParse(localStorage.getItem(checkoutInfoKey), {});
}

function parseParams() {
  return Object.fromEntries(
    new URLSearchParams(window.location.search).entries(),
  );
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getOrderCode() {
  const params = parseParams();
  const stored = sessionStorage.getItem("kafeOrderCode");
  const code =
    params.order || stored || `KAFE-${Date.now().toString().slice(-7)}`;

  sessionStorage.setItem("kafeOrderCode", code);
  return code;
}

function getDeliveryLabel(value) {
  return value === "retiro" ? "Retiro acordado" : "Entrega a domicilio";
}

function getMethodLabel(value) {
  const labels = {
    tarjeta: "Tarjeta",
    movil: "Pago movil",
    transferencia: "Transferencia",
  };

  return labels[value] || labels.tarjeta;
}

function renderPaymentDetails() {
  const params = parseParams();
  const checkoutInfo = getCheckoutInfo();
  const cart = getCart();
  const container = document.getElementById("payment-details");
  const methodEl = document.getElementById("payment-method-label");
  const totalEl = document.getElementById("payment-total");
  const orderEl = document.getElementById("payment-order");
  const clientEl = document.getElementById("payment-client");
  const deliveryEl = document.getElementById("payment-delivery");
  const submitButton = document.getElementById("confirm-payment");

  if (!container || !methodEl || !totalEl) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="checkout-empty-state">
        <strong>No hay productos</strong>
        <span>Selecciona caf&eacute; antes de abrir la pasarela.</span>
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
            <span>${item.quantity} x Bs ${formatPrice(item.price)}</span>
          </div>
          <strong>Bs ${formatPrice(item.price * item.quantity)}</strong>
        </div>
      `,
      )
      .join("");
    if (submitButton) submitButton.disabled = false;
  }

  const amount = Number(params.amount) || getCartTotal(cart);
  const method = params.method || checkoutInfo.pago || "tarjeta";

  totalEl.textContent = `Bs ${formatPrice(amount)}`;
  methodEl.textContent = getMethodLabel(method);

  if (orderEl) orderEl.textContent = getOrderCode();
  if (clientEl) clientEl.textContent = checkoutInfo.nombre || "Por confirmar";
  if (deliveryEl) {
    deliveryEl.textContent = getDeliveryLabel(checkoutInfo.entrega);
  }
}

function updateCardPreview() {
  const nameInput = document.getElementById("card-name");
  const numberInput = document.getElementById("card-number");
  const expiryInput = document.getElementById("card-expiry");
  const cvcInput = document.getElementById("card-cvc");
  const previewName = document.getElementById("card-preview-name");
  const previewNumber = document.getElementById("card-preview-number");
  const previewExpiry = document.getElementById("card-preview-expiry");
  const cardBrand = document.getElementById("card-brand");

  if (numberInput) {
    const digits = numberInput.value.replace(/\D/g, "").slice(0, 16);
    numberInput.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

    const brand = digits.startsWith("5")
      ? "MASTER"
      : digits.startsWith("4")
        ? "VISA"
        : "CARD";
    if (cardBrand) cardBrand.textContent = brand;
    if (previewNumber) {
      previewNumber.textContent =
        numberInput.value.padEnd(19, "0") || "0000 0000 0000 0000";
    }
  }

  if (expiryInput) {
    const digits = expiryInput.value.replace(/\D/g, "").slice(0, 4);
    expiryInput.value =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    if (previewExpiry) previewExpiry.textContent = expiryInput.value || "MM/AA";
  }

  if (cvcInput) {
    cvcInput.value = cvcInput.value.replace(/\D/g, "").slice(0, 4);
  }

  if (previewName && nameInput) {
    previewName.textContent =
      nameInput.value.trim().toUpperCase() || "NOMBRE DEL TITULAR";
  }
}

function setAuthStep(index) {
  document.querySelectorAll("#gateway-auth-list span").forEach((step, i) => {
    step.classList.toggle("is-active", i <= index);
  });
}

function setStatus(message) {
  const statusEl = document.getElementById("payment-status");
  if (statusEl) statusEl.textContent = message;
}

function finishPayment(button) {
  const cart = getCart();
  const amount = getCartTotal(cart);
  const receiptEl = document.getElementById("gateway-receipt");
  const orderCode = getOrderCode();

  setAuthStep(2);
  setStatus("Pago aprobado.");

  if (receiptEl) {
    receiptEl.hidden = false;
    receiptEl.innerHTML = `
      <span class="summary-kicker">Comprobante</span>
      <strong>${orderCode}</strong>
      <small>Total autorizado: Bs ${formatPrice(amount)}</small>
      <small>Referencia: ${Math.floor(100000 + Math.random() * 900000)}</small>
      <a class="btn btn-primary" href="tienda.html">Volver a la tienda</a>
    `;
  }

  localStorage.setItem(storageKey, "[]");
  window.dispatchEvent(new CustomEvent("kafe-cart-updated"));

  if (button) {
    button.disabled = true;
    button.textContent = "Pago aprobado";
  }
}

function handleConfirm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const button = document.getElementById("confirm-payment");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (getCart().length === 0) {
    setStatus("No hay productos para autorizar.");
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "Autorizando...";
  }

  setAuthStep(0);
  setStatus("Validando datos de compra.");

  window.setTimeout(() => {
    setAuthStep(1);
    setStatus("Conectando con el banco emisor.");
  }, 850);

  window.setTimeout(() => {
    setStatus("Confirmando autorizacion.");
  }, 1700);

  window.setTimeout(() => finishPayment(button), 2600);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("payment-form");

  renderPaymentDetails();
  updateCardPreview();

  document
    .querySelectorAll("#card-name, #card-number, #card-expiry, #card-cvc")
    .forEach((field) => {
      field.addEventListener("input", updateCardPreview);
    });

  if (form) form.addEventListener("submit", handleConfirm);
});
