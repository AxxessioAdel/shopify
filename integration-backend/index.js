// integration-backend/index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import { handleProductSync } from "./shopify-product-sync.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Webhook Endpoint für Product Provisioning
app.post("/api/product-provisioning", handleProductSync);

// Neuer API Endpoint: Liste aller Produkte
app.get("/api/products", async (req, res) => {
  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token":
            process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
      }
    );

    const data = await response.json();

    console.log(
      "✅ Shopify vollständige Antwort:",
      JSON.stringify(data, null, 2)
    );

    if (!data.products) {
      console.warn("⚠️ Achtung: Keine 'products' im Response gefunden!");
      return res.json({ products: [] });
    }

    res.json({ products: data.products });
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Produktliste:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Produkte." });
  }
});

// Neuer API Endpoint: Einzelnes Produkt abrufen
app.get("/api/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products/${productId}.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token":
            process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
      }
    );

    const data = await response.json();
    res.json(data.product);
  } catch (error) {
    console.error("❌ Fehler beim Abrufen des Produktes:", error);
    res.status(500).json({ error: "Fehler beim Abrufen des Produktes." });
  }
});

// Server starten
const PORT = process.env.INTEGRATION_BACKEND_PORT;

app.listen(PORT, () => {
  console.log(
    `✅ Product Provisioning Service läuft auf http://localhost:${PORT}`
  );
});

// Route: Produkt aktualisieren
app.put("/api/products/:id", async (req, res) => {
  const productId = req.params.id;

  // Validate required fields
  if (
    !req.body.title ||
    !req.body.description ||
    !req.body.vendor ||
    !req.body.product_type
  ) {
    console.error("❌ Missing required fields in request body.");
    return res.status(400).json({ error: "Missing required fields." });
  }

  const variants = req.body.variants || [];
  const options = req.body.options || [];
  const images = req.body.images || [];

  const updatePayload = {
    product: {
      id: productId,
      title: req.body.title,
      body_html: req.body.description,
      vendor: req.body.vendor,
      product_type: req.body.product_type,
      tags: req.body.tags || [],
      images: images.map((src) => ({ src })),
      variants: variants.map((v, index) => ({
        id: v.id,
        option1: v.option1,
        price: v.price,
        position: v.position || index + 1,
      })),
      options: options.map((opt) => ({
        name: opt.name,
        values: opt.values,
      })),
    },
  };

  console.log("🔍 Update Payload:", JSON.stringify(updatePayload, null, 2));

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products/${productId}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token":
            process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
        body: JSON.stringify(updatePayload),
      }
    );

    const responseData = await response.json();
    console.log("🔍 Shopify API Response:", responseData);

    if (!response.ok) {
      console.error("❌ Shopify API Error:", responseData);
      return res.status(500).json({ error: "Failed to update product." });
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});
