import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const SHOPIFY_API_URL = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/webhooks.json`;
const SHOPIFY_ADMIN_API_TOKEN = process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;
const WEBHOOK_ADDRESS = process.env.WEBHOOK_ADDRESS;
const isDebug = process.env.DEBUG_MODE === "true";

if (isDebug) {
  console.log("*** From registerWebhook.js ***");
  console.log("[DEBUG] SHOPIFY_ADMIN_API_TOKEN:", SHOPIFY_ADMIN_API_TOKEN);
}

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
        "Content-Type": CONTENT_TYPE,
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
