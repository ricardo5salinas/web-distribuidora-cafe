(function () {
  const storageKey = "kafeCart";
  const chatStorageKey = "kafeAssistantMessages";
  const whatsappNumber = "580000000000";

  const products = [
    {
      id: "empacado-250g",
      name: "Empaque Kafé 250 g",
      category: "empacado",
      price: 18500,
      tag: "Reventa",
      producer: "Andes Café",
      image:
        "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=720&q=80",
      description:
        "Presentacion compacta para anaqueles, regalos corporativos y compra diaria.",
      bestFor:
        "tiendas, detalles corporativos y clientes que prueban la marca.",
    },
    {
      id: "grano-1kg",
      name: "Grano espresso 1 kg",
      category: "grano",
      price: 68000,
      tag: "Barista",
      producer: "Andes Café",
      image: "assets/molido.png",
      description:
        "Tostado estable para barras de cafe, restaurantes y molinos de alto consumo.",
      bestFor: "cafeterias, restaurantes y equipos con molino propio.",
    },
    {
      id: "molido-500g",
      name: "Molido por metodo 500 g",
      category: "molido",
      price: 32000,
      tag: "Diario",
      producer: "Andes Café",
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=720&q=80",
      description:
        "Molienda ajustada para espresso, filtro, prensa, moka o preparacion tradicional.",
      bestFor:
        "hogares, oficinas y compradores que quieren preparar sin molino.",
    },
    {
      id: "mayorista-10kg",
      name: "Surtido mayorista 10 kg",
      category: "mayorista",
      price: 650000,
      tag: "Volumen",
      producer: "Andes Café",
      image:
        "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=720&q=80",
      description:
        "Pedidos mixtos por kilo, caja o saco para distribuidores y compradores recurrentes.",
      bestFor: "negocios con rotacion frecuente y pedidos por volumen.",
    },
  ];

  const quickPrompts = [
    "Recomiendame un cafe",
    "Cafe para casa",
    "Cafe para mi negocio",
    "Quiero comprar al mayor",
    "Ver precios",
    "Como preparo el cafe",
  ];

  const intentRules = [
    {
      intent: "greeting",
      keywords: [
        "hola",
        "buenas",
        "saludos",
        "hey",
        "buen dia",
        "buenas tardes",
      ],
    },
    {
      intent: "thanks",
      keywords: ["gracias", "perfecto", "listo", "excelente", "ok", "vale"],
    },
    {
      intent: "price",
      keywords: [
        "precio",
        "precios",
        "cuanto",
        "cuesta",
        "costo",
        "valor",
        "bs",
        "bolivar",
        "barato",
        "economico",
        "presupuesto",
      ],
    },
    {
      intent: "wholesale",
      keywords: [
        "mayor",
        "mayorista",
        "saco",
        "distribuidor",
        "distribuidora",
        "negocio",
        "bulto",
        "volumen",
        "cantidad grande",
        "caja",
        "proveedor",
        "revender",
        "reventa",
        "tienda",
      ],
    },
    {
      intent: "recommendation",
      keywords: [
        "recom",
        "cual",
        "elegir",
        "mejor",
        "suger",
        "aconseja",
        "conviene",
        "ideal",
        "necesito",
        "sirve",
        "opcion",
        "opciones",
        "quiero",
      ],
    },
    {
      intent: "contact",
      keywords: [
        "whatsapp",
        "contact",
        "cotiz",
        "telefono",
        "asesor",
        "mensaje",
        "llamar",
      ],
    },
    {
      intent: "shipping",
      keywords: [
        "envio",
        "envios",
        "entrega",
        "delivery",
        "despacho",
        "ciudad",
        "ruta",
        "recibir",
        "mandan",
        "llega",
        "enviar",
        "retiro",
      ],
    },
    {
      intent: "origin",
      keywords: [
        "origen",
        "andino",
        "merida",
        "tachira",
        "trujillo",
        "venezuela",
        "venezolano",
        "altura",
      ],
    },
    {
      intent: "cart",
      keywords: [
        "carrito",
        "pedido",
        "comprar",
        "compra",
        "orden",
        "pagar",
        "agregar",
        "llevar",
        "quiero uno",
        "quiero comprar",
      ],
    },
    {
      intent: "brew",
      keywords: [
        "prepar",
        "moler",
        "molienda",
        "espresso",
        "filtro",
        "prensa",
        "moka",
        "cafetera",
        "metodo",
        "colar",
        "colado",
        "guayoyo",
        "aeropress",
        "v60",
      ],
    },
    {
      intent: "flavor",
      keywords: [
        "sabor",
        "notas",
        "aroma",
        "perfil",
        "fuerte",
        "suave",
        "amargo",
        "acidez",
        "dulce",
        "chocolate",
        "panela",
        "citrico",
        "intenso",
      ],
    },
    {
      intent: "difference",
      keywords: [
        "diferencia",
        "comparar",
        "comparacion",
        "grano o molido",
        "molido o grano",
        "versus",
        "vs",
      ],
    },
    {
      intent: "availability",
      keywords: [
        "disponible",
        "disponibilidad",
        "stock",
        "hay",
        "tienen",
        "queda",
        "inventario",
      ],
    },
    {
      intent: "payment",
      keywords: [
        "pago",
        "pagos",
        "pagar",
        "transferencia",
        "punto",
        "movil",
        "divisa",
        "dolar",
        "efectivo",
      ],
    },
    {
      intent: "productEmpacado",
      keywords: ["empacado", "250", "bolsa", "reventa", "anaquel", "regalo"],
    },
    {
      intent: "productGrano",
      keywords: [
        "grano",
        "barista",
        "molino",
        "1 kg",
        "1kg",
        "cafeteria",
        "restaurante",
      ],
    },
    {
      intent: "productMolido",
      keywords: ["molido", "500", "oficina", "casa", "hogar", "diario"],
    },
  ];

  function formatPrice(amount) {
    return new Intl.NumberFormat("es-VE").format(amount);
  }

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const faqDatabase = [];
  const faqDatabasePromise = fetch("/js/chatbot-faq.json")
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data?.faqs && Array.isArray(data.faqs)) {
        faqDatabase.push(...data.faqs);
      }
    })
    .catch(() => []);

  function findFaqAnswer(text) {
    const normalized = normalizeText(text);
    return faqDatabase.find((item) => {
      if (
        item.questions?.some((question) =>
          normalized.includes(normalizeText(question)),
        )
      ) {
        return true;
      }
      if (
        item.keywords?.some((keyword) =>
          normalized.includes(normalizeText(keyword)),
        )
      ) {
        return true;
      }
      return false;
    });
  }

  function getFaqAnswer(text) {
    const answer = findFaqAnswer(text);
    return answer ? answer.answer : null;
  }

  function detectIntent(text) {
    const normalized = normalizeText(text);
    const scores = intentRules.map((rule) => {
      const score = rule.keywords.reduce((total, keyword) => {
        return normalized.includes(keyword) ? total + 1 : total;
      }, 0);

      return { intent: rule.intent, score };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores[0]?.score > 0 ? scores[0].intent : "fallback";
  }

  function detectIntents(text) {
    const normalized = normalizeText(text);
    return intentRules
      .map((rule) => ({
        intent: rule.intent,
        score: rule.keywords.reduce((total, keyword) => {
          return normalized.includes(keyword) ? total + 1 : total;
        }, 0),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.intent);
  }

  function getMessageContext(text) {
    const normalized = normalizeText(text);
    const intents = detectIntents(text);
    const quantityMatch = normalized.match(
      /(\d+)\s*(kg|kilo|kilos|gramo|gramos|g|bolsa|bolsas|saco|sacos|caja|cajas|unidad|unidades)/,
    );

    const useCases = [
      { key: "casa", label: "casa", productId: "molido-500g" },
      { key: "hogar", label: "casa", productId: "molido-500g" },
      { key: "oficina", label: "oficina", productId: "molido-500g" },
      { key: "cafeteria", label: "cafeteria", productId: "grano-1kg" },
      { key: "restaurante", label: "restaurante", productId: "grano-1kg" },
      { key: "tienda", label: "tienda o reventa", productId: "empacado-250g" },
      { key: "reventa", label: "tienda o reventa", productId: "empacado-250g" },
      { key: "mayor", label: "compra mayorista", productId: "mayorista-10kg" },
      { key: "negocio", label: "negocio", productId: "mayorista-10kg" },
    ];

    const methods = [
      "espresso",
      "filtro",
      "prensa",
      "moka",
      "cafetera",
      "guayoyo",
      "colado",
      "v60",
    ];

    const matchedUse = useCases.find((item) => normalized.includes(item.key));
    const matchedMethod = methods.find((method) => normalized.includes(method));
    const matchedProducts = products.filter((product) => {
      const name = normalizeText(product.name);
      return (
        normalized.includes(product.category) ||
        normalized.includes(product.id.replace(/-/g, " ")) ||
        name
          .split(" ")
          .filter((word) => word.length > 3)
          .some((word) => normalized.includes(word))
      );
    });

    if (
      matchedUse &&
      !matchedProducts.some((item) => item.id === matchedUse.productId)
    ) {
      const suggested = products.find(
        (product) => product.id === matchedUse.productId,
      );
      if (suggested) matchedProducts.unshift(suggested);
    }

    return {
      normalized,
      intents,
      quantity: quantityMatch ? quantityMatch[0] : "",
      useCase: matchedUse?.label || "",
      method: matchedMethod || "",
      products: matchedProducts,
    };
  }

  function getPrimaryIntent(text) {
    const context = getMessageContext(text);
    return context.intents[0] || "fallback";
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (e) {
      // ignore
    }

    // Intentar sincronizar con el servidor (no bloqueante)
    try {
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      }).catch(() => {});
    } catch (_e) {}

    window.dispatchEvent(new CustomEvent("kafe-cart-updated"));
    updateVisibleCartCount(cart);
  }

  function updateVisibleCartCount(cart = getCart()) {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((element) => {
      element.textContent = count;
    });
  }

  function addProductToCart(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return null;

    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        tag: product.tag,
        brand: "Kafé C.A.",
        producer: product.producer,
        image: product.image,
        quantity: 1,
      });
    }

    saveCart(cart);
    return product;
  }

  function getInitialMessages() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(chatStorageKey) || "[]");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (error) {
      sessionStorage.removeItem(chatStorageKey);
    }

    return [
      {
        role: "bot",
        text: "Hola, soy el asistente de Kafé C.A. Te ayudo a elegir cafe andino, cotizar pedidos y armar tu carrito.",
      },
    ];
  }

  let messages = getInitialMessages();

  function persistMessages() {
    const trimmed = messages
      .slice(-18)
      .map(({ role, text }) => ({ role, text }));
    sessionStorage.setItem(chatStorageKey, JSON.stringify(trimmed));
  }

  function createEl(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function buildWidget() {
    const root = createEl("section", "ai-chatbot");
    root.setAttribute("aria-label", "Asistente de Kafé C.A.");

    root.innerHTML = `
      <div class="ai-chat-panel" id="ai-chat-panel" aria-hidden="true">
        <div class="ai-chat-header">
          <div>
            <span>Asistente IA</span>
            <strong>Kafé Concierge</strong>
          </div>
          <button class="ai-chat-close" type="button" aria-label="Cerrar asistente">×</button>
        </div>
        <div class="ai-chat-mascot" aria-hidden="true">
          <div class="mascot-figure" role="img" aria-label="Mascota de café sonriente"></div>
          <div class="mascot-message">
            ¡Hola! Soy Kafé, tu amiguito cafetero. Puedo ayudar con productos, pedidos y WhatsApp.
          </div>
        </div>
        <div class="ai-chat-body" role="log" aria-live="polite"></div>
        <div class="ai-chat-suggestions" aria-label="Sugerencias rapidas"></div>
        <form class="ai-chat-form">
          <input type="text" name="message" autocomplete="off" placeholder="Pregunta por productos, precios o mayoristas" aria-label="Mensaje para el asistente" />
          <button type="submit">Enviar</button>
        </form>
      </div>
      <button class="ai-chat-launcher" type="button" aria-controls="ai-chat-panel" aria-expanded="false" aria-label="Abrir asistente de compras">
        <span class="ai-chat-pulse"></span>
        <span class="ai-chat-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3" y="6" width="18" height="12" rx="3" />
            <path d="M3 6l9 6 9-6" />
          </svg>
        </span>
      </button>
    `;

    document.body.appendChild(root);
    return root;
  }

  const root = buildWidget();
  const panel = root.querySelector(".ai-chat-panel");
  const body = root.querySelector(".ai-chat-body");
  const form = root.querySelector(".ai-chat-form");
  const input = root.querySelector(".ai-chat-form input");
  const launcher = root.querySelector(".ai-chat-launcher");
  const closeButton = root.querySelector(".ai-chat-close");
  const suggestions = root.querySelector(".ai-chat-suggestions");

  function renderSuggestions() {
    suggestions.innerHTML = "";
    quickPrompts.forEach((prompt) => {
      const button = createEl("button", "ai-chat-chip", prompt);
      button.type = "button";
      button.addEventListener("click", () => submitUserMessage(prompt));
      suggestions.appendChild(button);
    });
  }

  function renderProductCards(items) {
    const list = createEl("div", "ai-product-list");

    items.forEach((product) => {
      const card = createEl("article", "ai-product-card");
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.name;

      const content = createEl("div", "ai-product-content");
      content.appendChild(createEl("span", "ai-product-tag", product.tag));
      content.appendChild(createEl("strong", "", product.name));
      content.appendChild(
        createEl(
          "p",
          "",
          `${product.description} Ideal para ${product.bestFor}`,
        ),
      );
      content.appendChild(
        createEl("small", "", `Bs ${formatPrice(product.price)}`),
      );

      const action = createEl("button", "ai-product-action", "Agregar");
      action.type = "button";
      action.dataset.productId = product.id;
      content.appendChild(action);

      card.appendChild(image);
      card.appendChild(content);
      list.appendChild(card);
    });

    return list;
  }

  function renderActionButtons(actions) {
    const row = createEl("div", "ai-action-row");
    actions.forEach((action) => {
      const button = createEl("button", "ai-action-button", action.label);
      button.type = "button";
      button.dataset.action = action.type;
      if (action.value) button.dataset.value = action.value;
      row.appendChild(button);
    });
    return row;
  }

  function renderMessages() {
    body.innerHTML = "";

    messages.forEach((message) => {
      const bubble = createEl("div", `ai-message ai-message-${message.role}`);
      bubble.appendChild(createEl("p", "", message.text));

      if (message.products?.length) {
        bubble.appendChild(renderProductCards(message.products));
      }

      if (message.actions?.length) {
        bubble.appendChild(renderActionButtons(message.actions));
      }

      body.appendChild(bubble);
    });

    body.scrollTop = body.scrollHeight;
  }

  function setOpen(isOpen) {
    panel.classList.toggle("is-open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    launcher.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
      setTimeout(() => input.focus(), 120);
    }
  }

  function addMessage(message) {
    messages.push(message);
    persistMessages();
    renderMessages();
  }

  function getRelatedProducts(text) {
    const context = getMessageContext(text);
    const intent = context.intents[0] || "fallback";

    if (context.products.length) {
      return context.products;
    }

    if (intent === "wholesale") {
      return products.filter((product) => product.category === "mayorista");
    }

    if (intent === "brew") {
      return products.filter((product) =>
        ["molido-500g", "grano-1kg"].includes(product.id),
      );
    }

    if (intent === "productEmpacado") {
      return products.filter((product) => product.id === "empacado-250g");
    }

    if (intent === "productGrano") {
      return products.filter((product) => product.id === "grano-1kg");
    }

    if (intent === "productMolido") {
      return products.filter((product) => product.id === "molido-500g");
    }

    if (
      ["price", "recommendation", "cart", "difference", "flavor"].includes(
        intent,
      )
    ) {
      return products;
    }

    return [];
  }

  function getSmartActions(text) {
    const intent = getPrimaryIntent(text);

    if (["contact", "shipping", "wholesale"].includes(intent)) {
      return [
        { type: "whatsapp", label: "Abrir WhatsApp" },
        { type: "section", label: "Ir a contacto", value: "contacto" },
      ];
    }

    if (
      ["cart", "price", "recommendation", "difference", "flavor"].includes(
        intent,
      )
    ) {
      return [
        { type: "cart", label: "Ver carrito" },
        { type: "section", label: "Ver catalogo", value: "catalogo" },
      ];
    }

    if (intent === "origin") {
      return [{ type: "section", label: "Leer origen", value: "origen" }];
    }

    return [
      { type: "section", label: "Ver catalogo", value: "catalogo" },
      { type: "whatsapp", label: "Contactar" },
    ];
  }

  async function requestAiReply(text) {
    const history = messages
      .filter(
        (message) => ["user", "bot"].includes(message.role) && message.text,
      )
      .slice(-10)
      .map((message) => ({ role: message.role, text: message.text }));

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history,
        cart: getCart(),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.reply) {
      throw new Error(data.detail || data.error || "La IA no respondio.");
    }

    return {
      role: "bot",
      text: data.reply,
      products: getRelatedProducts(`${text} ${data.reply}`),
      actions: getSmartActions(`${text} ${data.reply}`),
    };
  }

  function answerMessage(text) {
    const context = getMessageContext(text);
    const intent = context.intents[0] || "fallback";
    const selectedProducts = context.products.length
      ? context.products
      : getRelatedProducts(text);

    if (intent === "greeting") {
      return {
        role: "bot",
        text: "Hola. Puedo recomendarte un cafe segun tu uso, mostrar precios, explicar formatos, ayudarte con mayoristas o armar tu carrito.",
        actions: [
          { type: "section", label: "Ver catalogo", value: "catalogo" },
          { type: "whatsapp", label: "Contactar" },
        ],
      };
    }

    if (intent === "thanks") {
      return {
        role: "bot",
        text: "Con gusto. Cuando quieras, puedo comparar formatos, agregar productos al carrito o preparar el mensaje para cotizar por WhatsApp.",
        actions: [{ type: "cart", label: "Ver carrito" }],
      };
    }

    const faqAnswer = getFaqAnswer(text);
    if (faqAnswer && intent === "fallback") {
      return {
        role: "bot",
        text: faqAnswer,
        actions: [
          { type: "section", label: "Ver catalogo", value: "catalogo" },
          { type: "whatsapp", label: "Contactar" },
        ],
      };
    }

    if (intent === "wholesale") {
      const quantityText = context.quantity
        ? ` Para ${context.quantity}, conviene confirmar disponibilidad y precio final por WhatsApp.`
        : "";

      return {
        role: "bot",
        text: `Para compra al mayor te conviene el Surtido mayorista 10 kg. Permite combinar formatos y coordinar disponibilidad, precio y entrega.${quantityText}`,
        products: selectedProducts.length
          ? selectedProducts
          : products.filter((product) => product.category === "mayorista"),
        actions: [
          { type: "whatsapp", label: "Cotizar por WhatsApp" },
          { type: "section", label: "Ver mayoristas", value: "mayoristas" },
        ],
      };
    }

    if (intent === "price") {
      const productText =
        selectedProducts.length === 1
          ? `El precio publicado de ${selectedProducts[0].name} es Bs ${formatPrice(selectedProducts[0].price)}.`
          : "Estos son los precios publicados del catalogo.";

      return {
        role: "bot",
        text: `${productText} Puedo agregar el producto al carrito o ayudarte a elegir segun uso.`,
        products: selectedProducts.length ? selectedProducts : products,
        actions: [{ type: "cart", label: "Abrir carrito" }],
      };
    }

    if (intent === "recommendation") {
      if (context.useCase && selectedProducts.length) {
        const product = selectedProducts[0];
        return {
          role: "bot",
          text: `Para ${context.useCase}, te recomiendo ${product.name}. ${product.description} Es una buena opcion para ${product.bestFor}`,
          products: selectedProducts,
          actions: [
            { type: "cart", label: "Ver carrito" },
            { type: "section", label: "Ver catalogo", value: "catalogo" },
          ],
        };
      }

      return {
        role: "bot",
        text: "Mi recomendacion: molido 500 g para casa u oficina, grano 1 kg para cafeterias con molino, empacado 250 g para reventa y mayorista 10 kg para rotacion alta.",
        products,
        actions: [
          { type: "section", label: "Ver catalogo", value: "catalogo" },
          { type: "whatsapp", label: "Pedir asesoria" },
        ],
      };
    }

    if (intent === "difference") {
      return {
        role: "bot",
        text: "La diferencia principal es el control. En grano conserva mejor aroma y sirve si tienes molino. Molido es mas practico para casa u oficina porque llega listo para preparar. Empacado 250 g funciona mejor para reventa o regalos.",
        products: selectedProducts.length
          ? selectedProducts
          : products.slice(0, 3),
        actions: [
          { type: "section", label: "Ver catalogo", value: "catalogo" },
          { type: "whatsapp", label: "Pedir asesoria" },
        ],
      };
    }

    if (intent === "flavor") {
      return {
        role: "bot",
        text: "El perfil de marca apunta a una taza andina balanceada: aroma marcado, dulzor tipo chocolate o panela, acidez limpia y cuerpo sedoso. Si quieres una taza mas fresca, pide molido por metodo; si buscas mas aroma, elige grano.",
        products: selectedProducts.length
          ? selectedProducts
          : products.filter((product) =>
              ["molido-500g", "grano-1kg"].includes(product.id),
            ),
        actions: [
          { type: "section", label: "Ver catalogo", value: "catalogo" },
        ],
      };
    }

    if (intent === "contact") {
      return {
        role: "bot",
        text: "Puedes enviar una cotizacion por WhatsApp. Incluye formato, cantidad estimada y ciudad para que el equipo prepare la respuesta comercial.",
        actions: [
          { type: "whatsapp", label: "Abrir WhatsApp" },
          { type: "section", label: "Ir al formulario", value: "contacto" },
        ],
      };
    }

    if (intent === "shipping") {
      const cityHint = context.normalized.includes("caracas")
        ? " Para Caracas, igual conviene confirmar ruta y disponibilidad antes de cerrar el pedido."
        : "";

      return {
        role: "bot",
        text: `Las entregas se coordinan por WhatsApp segun ciudad, cantidad y disponibilidad.${cityHint} Para cotizar bien, envia formato, cantidad estimada, ciudad y frecuencia de compra.`,
        actions: [
          { type: "whatsapp", label: "Coordinar entrega" },
          { type: "section", label: "Ir a contacto", value: "contacto" },
        ],
      };
    }

    if (intent === "availability") {
      return {
        role: "bot",
        text: "La disponibilidad puede cambiar por lote y cantidad. Dime el formato y la cantidad que buscas, o abre WhatsApp para confirmar stock antes de comprar.",
        products: selectedProducts,
        actions: [
          { type: "whatsapp", label: "Confirmar stock" },
          { type: "section", label: "Ver catalogo", value: "catalogo" },
        ],
      };
    }

    if (intent === "payment") {
      return {
        role: "bot",
        text: "Los metodos de pago deben confirmarse por WhatsApp antes de cerrar el pedido. Puedo ayudarte a armar el carrito y preparar el mensaje con productos y cantidades.",
        actions: [
          { type: "cart", label: "Ver carrito" },
          { type: "whatsapp", label: "Consultar pago" },
        ],
      };
    }

    if (intent === "origin") {
      return {
        role: "bot",
        text: "Kafé C.A. comunica un cafe venezolano de inspiracion andina, con referencias a Merida, Tachira y Trujillo, pensado para una taza balanceada con caracter de altura.",
        actions: [{ type: "section", label: "Leer origen", value: "origen" }],
      };
    }

    if (intent === "cart") {
      const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
      return {
        role: "bot",
        text:
          count > 0
            ? `Tienes ${count} producto(s) en el carrito. Puedes revisar cantidades y enviar el pedido por WhatsApp.`
            : "Tu carrito esta vacio. Te muestro productos para que empieces el pedido.",
        products: count > 0 ? [] : products,
        actions: [{ type: "cart", label: "Abrir carrito" }],
      };
    }

    if (intent === "brew") {
      const methodText = context.method
        ? ` Para ${context.method}, pide la molienda ajustada a ese metodo.`
        : "";

      return {
        role: "bot",
        text: `Para preparacion sin molino, el Molido por metodo 500 g es lo mas practico.${methodText} Si tienes molino o barra de cafe, el Grano espresso 1 kg conserva mejor aroma y te permite ajustar la molienda.`,
        products: selectedProducts.length
          ? selectedProducts
          : products.filter((product) =>
              ["molido-500g", "grano-1kg"].includes(product.id),
            ),
        actions: [
          { type: "section", label: "Ver catalogo", value: "catalogo" },
        ],
      };
    }

    if (intent === "productEmpacado") {
      return {
        role: "bot",
        text: "El Empaque Kafé 250 g es el formato mas comodo para exhibir, regalar o vender por unidad. Es buena entrada para tiendas y clientes nuevos.",
        products: products.filter((product) => product.id === "empacado-250g"),
      };
    }

    if (intent === "productGrano") {
      return {
        role: "bot",
        text: "El Grano espresso 1 kg funciona mejor para cafeterias, restaurantes o usuarios con molino. Mantiene mejor el aroma y permite ajustar molienda por metodo.",
        products: products.filter((product) => product.id === "grano-1kg"),
      };
    }

    if (intent === "productMolido") {
      return {
        role: "bot",
        text: "El Molido por metodo 500 g es la opcion practica para casa, oficina o consumo diario porque no necesitas molino y puedes pedir molienda segun preparacion.",
        products: products.filter((product) => product.id === "molido-500g"),
      };
    }

    if (selectedProducts.length) {
      const product = selectedProducts[0];
      return {
        role: "bot",
        text: `Sobre ${product.name}: ${product.description} Su precio publicado es Bs ${formatPrice(product.price)} y suele servir para ${product.bestFor} Puedes agregarlo al carrito o preguntarme por preparacion, envio o compra al mayor.`,
        products: selectedProducts,
        actions: [
          { type: "cart", label: "Ver carrito" },
          { type: "section", label: "Ver catalogo", value: "catalogo" },
        ],
      };
    }

    if (context.quantity || context.useCase || context.method) {
      const details = [
        context.quantity ? `cantidad: ${context.quantity}` : "",
        context.useCase ? `uso: ${context.useCase}` : "",
        context.method ? `metodo: ${context.method}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      return {
        role: "bot",
        text: `Con esos datos (${details}), puedo orientarte mejor si eliges entre molido, grano, empacado o mayorista. Para una respuesta rapida: molido para casa/oficina, grano para molino o cafeteria, empacado para reventa y mayorista para volumen.`,
        products,
        actions: [
          { type: "section", label: "Ver catalogo", value: "catalogo" },
          { type: "whatsapp", label: "Contactar" },
        ],
      };
    }

    return {
      role: "bot",
      text: "Puedo ayudarte con recomendaciones, precios, diferencias entre grano y molido, preparacion, envios, disponibilidad, pagos, mayoristas y carrito. Dime para que lo necesitas: casa, oficina, cafeteria, reventa o compra por volumen.",
      actions: [
        { type: "section", label: "Ver catalogo", value: "catalogo" },
        { type: "whatsapp", label: "Contactar" },
      ],
    };
  }

  async function submitUserMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    addMessage({ role: "user", text: cleanText });
    input.value = "";

    const typing = {
      role: "bot",
      text: "Estoy consultando el asistente IA...",
    };
    messages.push(typing);
    renderMessages();

    try {
      const aiReply = await requestAiReply(cleanText);
      messages = messages.filter((message) => message !== typing);
      messages.push(aiReply);
      persistMessages();
      renderMessages();
    } catch (error) {
      messages = messages.filter((message) => message !== typing);
      messages.push(answerMessage(cleanText));
      persistMessages();
      renderMessages();
    }
  }

  function goToSection(sectionId) {
    const targetPath = sectionId ? `index.html#${sectionId}` : "index.html";
    const isHome =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.endsWith("index.html") ||
      window.location.pathname === "";

    if (isHome && sectionId) {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.location.href = targetPath;
    }
  }

  function openWhatsApp() {
    const cart = getCart();
    const lines = [
      "Hola, quiero asesoria con cafe Kafé.",
      cart.length
        ? "Tengo productos en el carrito y quiero confirmar disponibilidad."
        : "Quiero cotizar productos de cafe.",
    ];
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener");
  }

  launcher.addEventListener("click", () => {
    setOpen(!panel.classList.contains("is-open"));
  });

  closeButton.addEventListener("click", () => setOpen(false));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitUserMessage(input.value);
  });

  body.addEventListener("click", (event) => {
    const productButton = event.target.closest(".ai-product-action");
    const actionButton = event.target.closest(".ai-action-button");

    if (productButton) {
      const product = addProductToCart(productButton.dataset.productId);
      if (product) {
        addMessage({
          role: "bot",
          text: `${product.name} fue agregado al carrito. Puedes seguir comprando o enviar el pedido por WhatsApp.`,
          actions: [
            { type: "cart", label: "Ver carrito" },
            { type: "whatsapp", label: "Enviar por WhatsApp" },
          ],
        });
      }
    }

    if (actionButton) {
      const { action, value } = actionButton.dataset;
      if (action === "section") goToSection(value);
      if (action === "whatsapp") openWhatsApp();
      if (action === "cart") window.location.href = "carrito.html";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      setOpen(false);
    }
  });

  renderSuggestions();
  renderMessages();
  updateVisibleCartCount();
})();
