// Product Synchronization Backend

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import { handleProductSync } from "./shopify-product-sync.js";

dotenv.config();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN = process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const PORT = process.env.INTEGRATION_BACKEND_PORT;

const isDebugLevelInfo = process.env.DEBUG_LEVEL === "info";
if (isDebugLevelInfo) {
  console.log("[Debug] Product Provisioning Service loaded with debug level info");
  console.log("[Debug] SHOPIFY_STORE_DOMAIN:", SHOPIFY_STORE_DOMAIN);
  console.log("[Debug] PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN:", PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN);
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
  console.log("[Debug] PORT:", PORT);
}

const app = express();
app.use(cors());
app.use(express.json());

// Webhook Endpoint für Product Provisioning
app.post("/api/product-provisioning", handleProductSync);

// Neuer API Endpoint: Liste aller Produkte
app.get("/api/products", async (req, res) => {
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": CONTENT_TYPE,
          "X-Shopify-Access-Token": PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
      }
    );

    const data = await response.json();

    console.log("✅ Shopify vollständige Antwort:", JSON.stringify(data, null, 2));

    if (!data.products) {
      return res.status(500).json({ error: "Keine Produkte gefunden" });
    }
    res.json(data.products);
  } catch (err) {
    console.error("Fehler beim Abrufen der Produkte:", err);
    res.status(500).json({ error: "Fehler beim Abrufen der Produkte" });
  }
});

app.listen(PORT, () => {
  console.log(`Product Synchronization Backend running on http://localhost:${PORT}`);
});
