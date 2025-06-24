import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Admin API Konfiguration
const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/webhooks.json`;
const SHOPIFY_ADMIN_API_TOKEN = process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;

// Print the token for debugging purposes
console.log("[DEBUG] SHOPIFY_ADMIN_API_TOKEN:", SHOPIFY_ADMIN_API_TOKEN);

// Webhook-Endpunkt (Platzhalter, später dynamisch anpassen)
const WEBHOOK_ADDRESS =
  "https://6632-2a02-908-390-db80-3d5c-3450-6ab8-329f.ngrok-free.app/webhooks/orders-paid";

async function registerWebhook() {
  console.debug(
    '[Webhook-Registrierung] Starte Registrierung für Topic "orders/paid"...'
  );
  try {
    const payload = {
      webhook: {
        topic: "orders/paid",
        address: WEBHOOK_ADDRESS,
        format: "json",
      },
    };
    console.debug("[Webhook-Registrierung] Sende POST an:", SHOPIFY_API_URL);
    console.debug("[Webhook-Registrierung] Payload:", JSON.stringify(payload));
    const response = await axios.post(SHOPIFY_API_URL, payload, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_TOKEN,
        "Content-Type": "application/json",
      },
    });
    console.debug("[Webhook-Registrierung] Antwortstatus:", response.status);
    console.log(
      "[Webhook-Registrierung] Webhook erfolgreich registriert:",
      response.data
    );
  } catch (error) {
    if (error.response) {
      console.error(
        "[Webhook-Registrierung] Fehlerhafte Antwort:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error(
        "[Webhook-Registrierung] Keine Antwort von Shopify erhalten:",
        error.message
      );
    } else {
      console.error(
        "[Webhook-Registrierung] Fehler beim Senden der Anfrage:",
        error.message
      );
    }
  }
}

registerWebhook();
