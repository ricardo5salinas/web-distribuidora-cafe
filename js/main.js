const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const form = document.querySelector(".contact-form");
const statusMessage = document.querySelector(".form-status");
const filterButtons = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll(".product-card");
const revealItems = document.querySelectorAll(
  ".section-heading, .intro > *, .metrics-strip article, .product-card, .story > *, .process-grid article, .contact > *"
);

const whatsappNumber = "580000000000";

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function closeMenu() {
  header.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
}

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
      const shouldShow = filter === "todos" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

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

  statusMessage.innerHTML = `Mensaje preparado. <a href="${url}" target="_blank" rel="noopener">Abrir WhatsApp</a>`;
  form.reset();
});

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
    { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

updateHeader();
