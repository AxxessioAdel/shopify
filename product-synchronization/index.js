// Product Synchronization Backend

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import { handleProductSync } from "./shopify-product-sync.js";

dotenv.config();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN =
  process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const PORT = process.env.INTEGRATION_BACKEND_PORT;
const isDebugMode = process.env.DEBUG_MODE === "true";

const isDebugLevelInfo = process.env.DEBUG_LEVEL === "info";
if (isDebugLevelInfo) {
  console.log(
    "[Debug] Product Provisioning Service loaded with debug level info"
  );
  console.log("[Debug] SHOPIFY_STORE_DOMAIN:", SHOPIFY_STORE_DOMAIN);
  console.log(
    "[Debug] PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN:",
    PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN
  );
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
          "X-Shopify-Access-Token":
            PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
      }
    );

    const data = await response.json();

    if (isDebugMode) {
      console.log(
        "✅ Shopify vollständige Antwort:",
        JSON.stringify(data, null, 2)
      );
    }

    if (!data.products) {
      return res.status(500).json({ error: "Keine Produkte gefunden" });
    }
    // Antwort als Objekt mit dem Schlüssel 'products' zurückgeben
    res.json({ products: data.products });
  } catch (err) {
    console.error("Fehler beim Abrufen der Produkte:", err);
    res.status(500).json({ error: "Fehler beim Abrufen der Produkte" });
  }
});

// API Endpoint: Einzelnes Produkt nach ID
app.get("/api/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products/${productId}.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": CONTENT_TYPE,
          "X-Shopify-Access-Token":
            PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
      }
    );
    const data = await response.json();
    if (!data.product) {
      return res.status(404).json({ error: "Produkt nicht gefunden" });
    }
    res.json(data.product);
  } catch (err) {
    console.error("Fehler beim Abrufen des Produkts:", err);
    res.status(500).json({ error: "Fehler beim Abrufen des Produkts" });
  }
});

// API Endpoint: Produkt aktualisieren (PUT)
app.put("/api/products/:id", async (req, res) => {
  const productId = req.params.id;
  const updatePayload = req.body;

  // Fix image mapping for Shopify
  let newImageSrc = null;
  if (
    updatePayload.images &&
    Array.isArray(updatePayload.images) &&
    updatePayload.images.length > 0 &&
    updatePayload.images[0].src
  ) {
    newImageSrc = updatePayload.images[0].src;
    updatePayload.image = newImageSrc;
  } else {
    delete updatePayload.image;
    delete updatePayload.images;
  }

  try {
    // 1. Update product info (text, variants, etc.)
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products/${productId}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": CONTENT_TYPE,
          "X-Shopify-Access-Token":
            PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
        body: JSON.stringify({ product: { id: productId, ...updatePayload } }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // 2. Handle product image update if needed
    if (newImageSrc) {
      // Get current images for the product
      const imagesRes = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products/${productId}/images.json`,
        {
          method: "GET",
          headers: {
            "Content-Type": CONTENT_TYPE,
            "X-Shopify-Access-Token": PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
          },
        }
      );
      const imagesData = await imagesRes.json();
      // Delete all current images before adding the new one
      if (imagesData.images && imagesData.images.length > 0) {
        for (const img of imagesData.images) {
          await fetch(
            `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products/${productId}/images/${img.id}.json`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": CONTENT_TYPE,
                "X-Shopify-Access-Token": PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
              },
            }
          );
        }
      }
      // Add the new image
      await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products/${productId}/images.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": CONTENT_TYPE,
            "X-Shopify-Access-Token": PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
          },
          body: JSON.stringify({ image: { src: newImageSrc } }),
        }
      );
    }

    res.json(data.product);
  } catch (err) {
    console.error("Fehler beim Aktualisieren des Produkts:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren des Produkts" });
  }
});

app.listen(PORT, () => {
  console.log(
    `Product Synchronization Backend running on http://localhost:${PORT}`
  );
});
