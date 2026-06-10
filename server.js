const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();

loadEnvFile(path.join(rootDir, ".env"));

const port = Number(process.env.PORT || 3000);
const openAiModel = process.env.OPENAI_MODEL || "gpt-5.2";
const maxBodyBytes = 24 * 1024;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};

const catalog = [
  {
    name: "Empaque Kafé 250 g",
    category: "Empacado",
    price: "Bs 18.500",
    use: "reventa, anaqueles, regalos corporativos y compra diaria",
  },
  {
    name: "Grano espresso 1 kg",
    category: "En grano",
    price: "Bs 68.000",
    use: "cafeterias, restaurantes, barras de cafe y clientes con molino",
  },
  {
    name: "Molido por metodo 500 g",
    category: "Molido",
    price: "Bs 32.000",
    use: "casa, oficina, moka, filtro, prensa, espresso y preparacion tradicional",
  },
  {
    name: "Surtido mayorista 10 kg",
    category: "Mayorista",
    price: "Bs 650.000",
    use: "distribuidores, negocios con rotacion alta y pedidos por volumen",
  },
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separator = trimmed.indexOf("=");
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

const cartFilePath = path.join(rootDir, "cart-data.json");

function readJsonFile(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, "utf8");
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (_error) {
    return defaultValue;
  }
}

function saveJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (_error) {
    return false;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maxBodyBytes) {
        reject(new Error("La solicitud es demasiado grande."));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("JSON invalido."));
      }
    });

    req.on("error", reject);
  });
}

function sanitizeMessages(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((message) => ["user", "bot"].includes(message.role) && message.text)
    .slice(-8)
    .map((message) => ({
      role: message.role === "bot" ? "assistant" : "user",
      content: String(message.text).slice(0, 700),
    }));
}

function buildInstructions(cart = []) {
  const cartSummary =
    Array.isArray(cart) && cart.length
      ? cart.map((item) => `${item.quantity || 1} x ${item.name}`).join(", ")
      : "sin productos";

  return [
    "Eres Kafé Concierge, el asistente de ventas de Kafé C.A.",
    "Responde siempre en espanol natural, breve y util.",
    "Tu objetivo es ayudar a elegir cafe, explicar formatos, orientar compras mayoristas, preparar pedidos y enviar a WhatsApp cuando haga falta.",
    "No inventes telefonos, horarios, direcciones, descuentos, disponibilidad ni zonas de envio. Si falta un dato, pide confirmarlo por WhatsApp.",
    "Catalogo disponible:",
    ...catalog.map(
      (product) =>
        `- ${product.name}: ${product.category}, ${product.price}, recomendado para ${product.use}.`,
    ),
    "Origen de marca: cafe venezolano premium de inspiracion andina, asociado a Merida, Tachira y Trujillo.",
    `Carrito actual del cliente: ${cartSummary}.`,
    "Si el usuario quiere comprar, sugiere agregar productos al carrito o coordinar por WhatsApp.",
  ].join("\n");
}

function extractResponseText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const output = Array.isArray(response.output) ? response.output : [];
  const textParts = [];

  output.forEach((item) => {
    const content = Array.isArray(item.content) ? item.content : [];
    content.forEach((part) => {
      if (typeof part.text === "string") textParts.push(part.text);
      if (typeof part.output_text === "string")
        textParts.push(part.output_text);
    });
  });

  return textParts.join("\n").trim();
}

function callOpenAI({ message, history, cart }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("OPENAI_API_KEY no esta configurada."));
  }

  const input = [
    ...sanitizeMessages(history),
    { role: "user", content: String(message).slice(0, 1200) },
  ];

  const payload = JSON.stringify({
    model: openAiModel,
    instructions: buildInstructions(cart),
    input,
    max_output_tokens: 420,
  });

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/responses",
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (apiResponse) => {
        let data = "";

        apiResponse.on("data", (chunk) => {
          data += chunk;
        });

        apiResponse.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (error) {
            reject(new Error("La API devolvio una respuesta invalida."));
            return;
          }

          if (apiResponse.statusCode < 200 || apiResponse.statusCode >= 300) {
            const message =
              parsed.error?.message ||
              `Error de OpenAI ${apiResponse.statusCode}`;
            reject(new Error(message));
            return;
          }

          const reply = extractResponseText(parsed);
          if (!reply) {
            reject(new Error("La API no devolvio texto."));
            return;
          }

          resolve(reply);
        });
      },
    );

    request.setTimeout(18000, () => {
      request.destroy(new Error("La API tardo demasiado en responder."));
    });

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

async function handleChatRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo no permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const message = String(body.message || "").trim();

    if (!message) {
      sendJson(res, 400, { error: "El mensaje es obligatorio." });
      return;
    }

    const reply = await callOpenAI({
      message,
      history: body.history,
      cart: body.cart,
    });

    sendJson(res, 200, { reply, model: openAiModel });
  } catch (error) {
    sendJson(res, 503, {
      error: "No se pudo consultar la IA.",
      detail: error.message,
    });
  }
}

async function handleCartRequest(req, res) {
  if (req.method === "GET") {
    const cart = readJsonFile(cartFilePath, []);
    sendJson(res, 200, cart);
    return;
  }

  if (req.method === "POST") {
    try {
      const body = await readJsonBody(req);
      const cart = Array.isArray(body.cart) ? body.cart : body;
      if (!Array.isArray(cart)) {
        sendJson(res, 400, {
          error: "El carrito debe ser una lista de productos.",
        });
        return;
      }
      saveJsonFile(cartFilePath, cart);
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 400, {
        error: "No se pudo guardar el carrito.",
        detail: error.message,
      });
    }
    return;
  }

  sendJson(res, 405, { error: "Metodo no permitido." });
}

function serveStaticFile(req, res) {
  const requestUrl = req.url.split("?")[0];
  const decodedPath = decodeURIComponent(requestUrl);
  const safePath = path.normalize(decodedPath).replace(/^\/+/, "");
  let filePath = path.join(rootDir, safePath || "index.html");

  if (!filePath.startsWith(rootDir)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("403 Forbidden");
    return;
  }

  if (filePath.endsWith(path.sep)) {
    filePath = path.join(filePath, "index.html");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.setHeader(
      "Content-Type",
      contentType + (contentType.startsWith("text/") ? "; charset=utf-8" : ""),
    );

    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      res.statusCode = 500;
      res.end("Server error");
    });
    stream.pipe(res);
  });
}

let listenPort = port;
let attempts = 0;

function startServer(p) {
  const serverInstance = http.createServer((req, res) => {
    const pathOnly = req.url.split("?")[0];
    if (pathOnly === "/api/chat") {
      handleChatRequest(req, res);
      return;
    }

    if (pathOnly === "/api/cart") {
      handleCartRequest(req, res);
      return;
    }

    serveStaticFile(req, res);
  });

  serverInstance.listen(p, () => {
    console.log(`Servidor local iniciado en http://localhost:${p}`);
    console.log(
      process.env.OPENAI_API_KEY
        ? `Chat IA activo con modelo ${openAiModel}`
        : "Chat IA sin API key: el frontend usara respuestas locales de respaldo.",
    );
  });

  serverInstance.on("error", (err) => {
    if (err && err.code === "EADDRINUSE" && attempts < 4) {
      attempts += 1;
      listenPort = p + 1;
      console.warn(`Puerto ${p} ocupado, intentando en ${listenPort}...`);
      setTimeout(() => startServer(listenPort), 300);
      return;
    }

    console.error("Error en el servidor:", err);
    process.exit(1);
  });
}

startServer(listenPort);
