// Aufgabe: Holt bezahlte Bestellungen von der Shopify Admin API
import fetch from "node-fetch";
import { getLastProcessedAt, setLastProcessedAt } from "../db/syncState.js";
import dotenv from "dotenv";
dotenv.config();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN =
  process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

const isDebugLevelInfo = process.env.DEBUG_LEVEL === "info";
if (isDebugLevelInfo) {
  console.log("[Debug] fetchPaidOrders loaded with debug level info");
  console.log("[Debug] SHOPIFY_STORE_DOMAIN:", SHOPIFY_STORE_DOMAIN);
  console.log(
    "[Debug] CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN:",
    CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN
  );
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
}

// Hilfsfunktion: Zieht Minuten von einem ISO-Timestamp ab
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
  // console.log("[Debug] fetchPaidOrders started");

  if (!SHOPIFY_STORE_DOMAIN || !CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN) {
    console.error("[Error] Shopify credentials missing", {
      SHOPIFY_STORE_DOMAIN,
      CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN,
    });
    throw new Error("Shopify credentials missing");
  }

  // Letzten Sync-Zeitpunkt aus der Datenbank holen
  const lastProcessedAt = getLastProcessedAt();
  console.log("[Debug] getLastProcessedAt():", lastProcessedAt);
  let url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/orders.json?financial_status=paid&status=any&fields=id,email,total_price,processed_at,line_items`;
  let processedAtMin = lastProcessedAt;
  if (lastProcessedAt) {
    processedAtMin = minusMinutes(lastProcessedAt, 2); // 2 Minuten zurück
    url += `&processed_at_min=${encodeURIComponent(processedAtMin)}`;
    console.log("[Debug] processed_at_min gesetzt:", processedAtMin);
  }
  console.log("[Debug] Shopify Orders URL:", url);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN,
        "Content-Type": CONTENT_TYPE,
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
    console.error("[Error] Fehler beim Abrufen der Bestellungen", {
      status: response.status,
      body: text,
    });
    throw new Error("Fehler beim Abrufen der Bestellungen");
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

  // Nur wirklich neue Bestellungen filtern
  let newOrders = orders;
  if (lastProcessedAt) {
    newOrders = orders.filter((order) => order.processed_at > lastProcessedAt);
    // Falls Bestellungen mit gleichem processed_at existieren, nur größere IDs berücksichtigen
    const sameTimeOrders = orders.filter(
      (order) => order.processed_at === lastProcessedAt
    );
    if (sameTimeOrders.length > 0) {
      // TODO: Bei Bedarf auch die ID der letzten Bestellung speichern und vergleichen
      // Aktuell werden nur Bestellungen mit processed_at > letztem Wert gesendet
    }
  }

  // processed_at der neuesten Bestellung speichern
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

// dotenv.config() entfernt, da zentrale Initialisierung in index.js erfolgt
