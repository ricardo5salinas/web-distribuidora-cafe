function formatPrice(amount) {
  return new Intl.NumberFormat("es-VE").format(amount);
}

function getCart() {
  return JSON.parse(localStorage.getItem("kafeCart") || "[]");
}

function parseParams() {
  return Object.fromEntries(
    new URLSearchParams(window.location.search).entries(),
  );
}

function renderPaymentDetails() {
  const params = parseParams();
  const cart = getCart();
  const container = document.getElementById("payment-details");
  const methodEl = document.getElementById("payment-method");
  const totalEl = document.getElementById("payment-total");
  const statusEl = document.getElementById("payment-status");

  if (!container || !methodEl || !totalEl) return;
  if (cart.length === 0) {
    container.innerHTML = "<p>No hay productos en el carrito.</p>";
    return;
  }

  const method = params.method || "tarjeta";
  container.innerHTML = cart
    .map(
      (item) => `
      <div class="checkout-item">
        <div>
          <strong>${item.name}</strong>
          <span>${item.quantity} × Bs ${formatPrice(item.price)}</span>
        </div>
        <strong>Bs ${formatPrice(item.price * item.quantity)}</strong>
      </div>
    `,
    )
    .join("");

  const amount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  totalEl.textContent = `Bs ${formatPrice(amount)}`;

  if (method === "tarjeta") {
    methodEl.innerHTML = `
      <p>Has elegido pago con tarjeta.</p>
      <p>Se ha creado una orden simulada por Bs ${formatPrice(amount)}.</p>
      <p>En una integración real, aquí se redirigiría a la pasarela del proveedor.</p>
    `;
  } else if (method === "movil") {
    methodEl.innerHTML = `
      <p>Pago móvil seleccionado.</p>
      <p>Envía el monto a tu número móvil y sube el comprobante.</p>
    `;
  } else if (method === "transferencia") {
    methodEl.innerHTML = `
      <p>Transferencia bancaria seleccionada.</p>
      <p>Utiliza los datos mostrados en el checkout y confirma con el comprobante.</p>
    `;
  }

  if (statusEl) {
    statusEl.textContent = "";
  }
}

function handleConfirm() {
  const statusEl = document.getElementById("payment-status");
  if (statusEl) {
    statusEl.innerHTML = `
      <div class="payment-success">
        <strong>Pago simulado completado</strong>
        <p>Gracias por tu pedido. Esto es una demostración local; reemplaza la pasarela con tu proveedor real.</p>
      </div>
    `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderPaymentDetails();
  const confirmButton = document.getElementById("confirm-payment");
  if (confirmButton) confirmButton.addEventListener("click", handleConfirm);
});
