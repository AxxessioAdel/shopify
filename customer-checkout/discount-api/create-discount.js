// discount-api/create-discount.js
// Diese Route ermöglicht das automatische Anlegen eines Price Rules und Discount Codes in Shopify.
// Schritt 1: Grundlegender Endpunkt für die Rabatt-API (noch ohne Shopify-Logik)

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const ADMIN_TOKEN = process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CONTENT_TYPE = process.env.CONTENT_TYPE;

// Hilfsfunktion: Produkt-ID anhand des Titels suchen
async function getProductIdByTitle(productTitle) {
  const response = await fetch(
    `https://${SHOP_DOMAIN}/admin/api/2025-04/products.json?title=${encodeURIComponent(
      productTitle
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
    }
  );
  const data = await response.json();
  if (data.products && data.products.length > 0) {
    return data.products[0].id;
  }
  return null;
}

// POST /api/discount/create
router.post("/create", async (req, res) => {
  // Schritt 2: Price Rule in Shopify anlegen
  // Produkt-Titel für die Rabattzuweisung
  const productTitle = "Digitale Autogrammkarte – Jamal Musiala";
  const productId = await getProductIdByTitle(productTitle);
  if (!productId) {
    return res.status(404).json({
      success: false,
      error: `Produkt '${productTitle}' nicht gefunden.`,
    });
  }
  // Beispielwerte für einen 5%-Rabatt auf ein bestimmtes Produkt
  const priceRulePayload = {
    price_rule: {
      title: "5% Rabatt auf Jamal Musiala Autogrammkarte",
      target_type: "line_item",
      target_selection: "entitled",
      allocation_method: "across",
      value_type: "percentage",
      value: "-5.0",
      customer_selection: "all",
      starts_at: new Date().toISOString(),
      entitled_product_ids: [productId], // Produktbindung
      usage_limit: null,
      once_per_customer: false,
    },
  };
  try {
    const response = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2025-04/price_rules.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": CONTENT_TYPE,
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify(priceRulePayload),
      }
    );
    const data = await response.json();
    if (!data.price_rule) {
      return res.status(500).json({ success: false, error: data });
    }
    // Schritt 2 erfolgreich: Price Rule wurde angelegt
    const priceRuleId = data.price_rule.id;
    // Schritt 3: Discount Code für die Price Rule anlegen
    const discountCodePayload = {
      discount_code: {
        code: "TEST5",
      },
    };
    const discountResponse = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2025-04/price_rules/${priceRuleId}/discount_codes.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": CONTENT_TYPE,
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify(discountCodePayload),
      }
    );
    const discountData = await discountResponse.json();
    if (!discountData.discount_code) {
      return res.status(500).json({ success: false, error: discountData });
    }
    // Beide Objekte zurückgeben
    return res.json({
      success: true,
      priceRule: data.price_rule,
      discountCode: discountData.discount_code,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
