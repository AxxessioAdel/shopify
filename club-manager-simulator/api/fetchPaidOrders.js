// Aufgabe: Holt bezahlte Bestellungen von der Shopify Admin API
import fetch from "node-fetch";
import { getLastProcessedAt, setLastProcessedAt } from "../db/syncState.js";

function minusMinutes(isoString, minutes) {
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - minutes);
  return date.toISOString();
}

/**
 * Holt bezahlte Bestellungen von Shopify
 * @returns {Promise<Array>} Array der bezahlten Bestellungen
 */
export default async function fetchPaidOrders() {
  const shop = process.env.SHOPIFY_SHOP;
  const accessToken = process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;

  console.log("[Debug] fetchPaidOrders started");

  if (!shop || !accessToken) {
    console.error("[Error] Shopify credentials missing", { shop, accessToken });
    throw new Error("Shopify credentials missing");
  }

  // Letzten Sync-Zeitpunkt holen
  const lastProcessedAt = getLastProcessedAt();
  console.log("[Debug] getLastProcessedAt():", lastProcessedAt);
  let url = `https://${shop}/admin/api/2025-04/orders.json?financial_status=paid&status=any&fields=id,email,total_price,processed_at,line_items`;
  let processedAtMin = lastProcessedAt;
  if (lastProcessedAt) {
    processedAtMin = minusMinutes(lastProcessedAt, 2); // 2 دقیقه عقب‌تر
    url += `&processed_at_min=${encodeURIComponent(processedAtMin)}`;
    console.log("[Debug] processed_at_min gesetzt:", processedAtMin);
  }
  console.log("[Debug] Shopify Orders URL:", url);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("[Error] Fehler beim HTTP-Request:", err);
    throw err;
  }

  const text = await response.text();
  console.log("[Debug] Response status:", response.status);
  // console.log("[Debug] Raw response:", text);

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
  let orders = data.orders || [];
  console.log("[Debug] Parsed orders count:", orders.length);

  // سفارش‌هایی که واقعاً جدید هستند را فیلتر کن
  let newOrders = orders;
  if (lastProcessedAt) {
    newOrders = orders.filter((order) => order.processed_at > lastProcessedAt);
    // اگر سفارش‌هایی با processed_at برابر داریم، فقط id بزرگ‌تر را نگه دار
    const sameTimeOrders = orders.filter(
      (order) => order.processed_at === lastProcessedAt
    );
    if (sameTimeOrders.length > 0) {
      // فرض: id آخرین سفارش sync شده را ذخیره کنیم (در صورت نیاز)
      // فعلاً فقط سفارش‌های با processed_at > آخرین مقدار را می‌فرستیم
      // اگر نیاز به دقت بیشتر بود، می‌توانیم id را هم ذخیره کنیم
    }
  }

  // processed_at جدیدترین سفارش را ذخیره کن
  if (orders.length > 0) {
    const maxProcessedAt = orders.reduce(
      (max, order) => (order.processed_at > max ? order.processed_at : max),
      orders[0].processed_at
    );
    setLastProcessedAt(maxProcessedAt);
    console.log("[Debug] setLastProcessedAt auf:", maxProcessedAt);
  }

  return newOrders;
}

// dotenv.config() removed, as central initialization is done in index.js
