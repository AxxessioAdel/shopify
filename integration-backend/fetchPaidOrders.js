// Dieses Skript holt bezahlte Bestellungen von Shopify und verwaltet den letzten Sync-Zeitpunkt.
// Wenn lastProcessedAt existiert, wird processed_at_min als Parameter verwendet.
// Nach dem Abruf wird das Maximum von processed_at gespeichert.

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import { getLastProcessedAt, setLastProcessedAt } from "../../club-manager-simulator/db/syncState.js";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN;

export async function fetchPaidOrders() {
  // Letzten Sync-Zeitpunkt holen
  const lastProcessedAt = getLastProcessedAt();
  let url = `https://${SHOPIFY_DOMAIN}/admin/api/2025-04/orders.json?financial_status=paid&status=any`;
  if (lastProcessedAt) {
    url += `&processed_at_min=${encodeURIComponent(lastProcessedAt)}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_TOKEN,
    },
  });

  const data = await response.json();

  if (!data.orders) {
    console.warn("⚠️ Keine 'orders' im Response gefunden!");
    return [];
  }

  if (data.orders.length > 0) {
    // Das Maximum von processed_at bestimmen
    const maxProcessedAt = data.orders.reduce((max, order) => {
      return order.processed_at > max ? order.processed_at : max;
    }, data.orders[0].processed_at);
    setLastProcessedAt(maxProcessedAt);
  }

  return data.orders;
}
