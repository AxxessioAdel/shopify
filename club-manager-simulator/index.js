import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import paymentConfirmation from "./routes/paymentConfirmation.js";

dotenv.config();
const app = express();

// Load .env variable
const PORT = process.env.CLUB_MANAGER_PORT;
const PROVISIONING_API_URL = process.env.PROVISIONING_API_URL;
const useWebhook = process.env.USE_WEBHOOK === "true";
const shop = process.env.SHOPIFY_SHOP;
const accessToken = process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;

console.log("[Debug] index.js gestartet");
// console.log("[Debug] PORT:", PORT);
// console.log("[Debug] PROVISIONING_API_URL:", PROVISIONING_API_URL);
// console.log("[Debug] USE_WEBHOOK:", useWebhook);
// console.log("[Debug] SHOPIFY_SHOP:", shop);
// console.log("[Debug] CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN:", accessToken);

// CORS support
app.use(cors());

// 🟢 Raw body parser MUST come first before JSON parser
app.use(
  "/webhooks",
  express.raw({
    type: "application/json",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Then regular JSON parser for everything else
app.use(express.json());

// Routes
app.use("/api", paymentConfirmation);

if (useWebhook) {
  import("./webhooks/ordersPaidWebhook.js").then(
    ({ default: ordersPaidWebhook }) => {
      app.use("/webhooks", ordersPaidWebhook);
      console.log("[Server] Webhook route aktiviert.");
    }
  );
} else {
  console.log("[Server] Webhook deaktiviert. Nutze stattdessen API-Modus.");
  import("./api/triggerPaymentSync.js").then(({ default: triggerSync }) => {
    app.get("/sync/payments", async (req, res) => {
      const result = await triggerSync();
      res.status(200).json(result);
    });
  });
}

// Simulation route for testing
app.post("/simulate-webhook", async (req, res) => {
  const payload = {
    title: "Autogrammkarte Messi",
    description: "Limitierte Auflage",
    vendor: "FC Barcelona",
    product_type: "Autogrammkarte",
    tags: ["Autogramm", "Deluxe", "Messi"],
    images: [
      {
        src: "https://res.cloudinary.com/dhrq96tlr/image/upload/v1749979271/box_dejf0a.png",
        alt: "Autogrammkarte Messi",
      },
    ],
    pricing_groups: [
      { name: "Standard", price: "29.99" },
      { name: "Deluxe", price: "59.99" },
    ],
  };

  try {
    const response = await fetch(PROVISIONING_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("✅ Webhook erfolgreich gesendet:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Fehler beim Senden des Webhooks:", error.message);
    res.status(500).json({ error: "Fehler bei der Webhook-Simulation" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Club Manager Simulator läuft auf http://localhost:${PORT}`);
});
