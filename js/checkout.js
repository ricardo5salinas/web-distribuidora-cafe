const storageKey = "kafeCart";
const paymentGatewayUrl = "pasarela.html"; // Pasarela local de prueba; reemplazar con URL real cuando tengas proveedor

function formatPrice(amount) {
  return new Intl.NumberFormat("es-VE").format(amount);
}

function getCart() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCheckoutItems() {
  const container = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const cart = getCart();

  if (!container) return;
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

  totalEl.textContent = `Bs ${formatPrice(getCartTotal(cart))}`;
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const cart = getCart();
  if (cart.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  // Guardar datos de envío localmente para uso futuro
  localStorage.setItem("kafeCheckoutInfo", JSON.stringify({ ...data }));

  const amount = getCartTotal(cart);
  const method = data.pago || "tarjeta";

  // Flujo según método seleccionado
  if (method === "tarjeta") {
    // Redirigir a pasarela local de prueba.
    const params = new URLSearchParams({
      amount: String(amount),
      currency: "VES",
      method: "tarjeta",
    });
    window.open(`${paymentGatewayUrl}?${params.toString()}`, "_blank");
    return;
  }

  if (method === "movil") {
    // Mostrar instrucciones de pago móvil en la misma página
    const movilEl = document.getElementById("movil-instructions");
    const transferenciaEl = document.getElementById(
      "transferencia-instructions",
    );
    if (transferenciaEl) transferenciaEl.classList.add("hidden");
    if (movilEl) {
      movilEl.classList.remove("hidden");
      movilEl.innerHTML = `
        <p>Enviar Bs ${formatPrice(amount)} al siguiente número de Pago Móvil:</p>
        <p><strong>Número:</strong> 0412-XXX-XXXX (Kafé C.A.)</p>
        <p>Referencia: <strong>ORDER-${Date.now()}</strong></p>
        <button class="btn btn-ghost" id="copy-movil">Copiar número</button>
        <p class="muted">Luego sube el comprobante en WhatsApp o confirma el pago.</p>
      `;
      setTimeout(() => {
        const copyBtn = document.getElementById("copy-movil");
        if (copyBtn)
          copyBtn.addEventListener("click", () =>
            navigator.clipboard.writeText("0412-XXX-XXXX"),
          );
      }, 40);
      movilEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  if (method === "transferencia") {
    const movilEl = document.getElementById("movil-instructions");
    const transferenciaEl = document.getElementById(
      "transferencia-instructions",
    );
    if (movilEl) movilEl.classList.add("hidden");
    if (transferenciaEl) {
      transferenciaEl.classList.remove("hidden");
      transferenciaEl.innerHTML = `
        <p>Transferencia bancaria por Bs ${formatPrice(amount)}:</p>
        <p><strong>Banco:</strong> Banco Ejemplo</p>
        <p><strong>Cuenta:</strong> 0123-456789-0</p>
        <p><strong>Titular:</strong> Kafé C.A.</p>
        <button class="btn btn-ghost" id="copy-transfer">Copiar datos</button>
        <p class="muted">Envía el comprobante por WhatsApp al terminar.</p>
      `;
      setTimeout(() => {
        const copyBtn = document.getElementById("copy-transfer");
        if (copyBtn)
          copyBtn.addEventListener("click", () =>
            navigator.clipboard.writeText(
              "Banco Ejemplo | 0123-456789-0 | Kafé C.A.",
            ),
          );
      }, 40);
      transferenciaEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");
  renderCheckoutItems();
  if (form) form.addEventListener("submit", handleSubmit);
});
