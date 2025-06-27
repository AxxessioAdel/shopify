// Aufgabe: Holt bezahlte Bestellungen von der Shopify Admin API
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const SHOP = process.env.SHOPIFY_SHOP;
const ACCESS_Token = process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;
/**
 * Holt bezahlte Bestellungen von Shopify
 * @returns {Promise<Array>} Array der bezahlten Bestellungen
 */
export default async function fetchPaidOrders() {
  console.log("[Debug] fetchPaidOrders aufgerufen");
  console.log("[Debug] SHOPIFY_SHOP:", SHOP);
  console.log("[Debug] CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN:", ACCESS_Token);

  if (!SHOP || !ACCESS_Token) {
    console.error("[Error] Shopify credentials missing", {
      shop: SHOP,
      accessToken: ACCESS_Token,
    });
    throw new Error("Shopify credentials missing");
  }

  const url = `https://${SHOP}/admin/api/2025-04/orders.json?financial_status=paid&status=any&fields=id,email,total_price,processed_at,line_items`;
  console.log("[Debug] Shopify Orders URL:", url);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": ACCESS_Token,
        "Content-Type": CONTENT_TYPE,
      },
    });
  } catch (err) {
    console.error("[Error] Fehler beim HTTP-Request:", err);
    throw err;
  }

  const text = await response.text();
  console.log("[Debug] Response status:", response.status);
  console.log("[Debug] Raw response:", text);

  if (!response.ok) {
    console.error("[Error] Failed to fetch orders", {
      status: response.status,
      body: text,
    });
    throw new Error("Failed to fetch orders");
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("[Error] Fehler beim Parsen der Antwort:", err);
    throw err;
  }
  console.log(
    "[Debug] Parsed orders count:",
    Array.isArray(data.orders) ? data.orders.length : "N/A"
  );
  return data.orders || [];
}
