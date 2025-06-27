import express from "express";
import crypto from "crypto";
import { sendPaymentDataToClubManager } from "../utils/clubManagerApiClient.js";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const isDebug = process.env.DEBUG_MODE === "true";

// Diesen Schlüssel musst du aus den App-Einstellungen in Shopify erhalten
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
if (isDebug) {
  console.log(
    chalk.green("[Webhook] SHOPIFY_WEBHOOK_SECRET geladen:"),
    SHOPIFY_WEBHOOK_SECRET
  );
}

// HMAC-Verifizierungsfunktion
function verifyShopifyWebhook(req) {
  const hmacHeader = (req.get("X-Shopify-Hmac-Sha256") || "").trim();
  const body = req.rawBody;

  if (!body || body.length === 0) {
    console.error(
      chalk.red("[Error] [Webhook] Raw-Body ist leer oder nicht gesetzt.")
    );
    return false;
  }

  const digest = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET.trim())
    .update(req.rawBody, "utf8")
    .digest("base64");

  const expected = Buffer.from(digest, "base64");
  const received = Buffer.from(hmacHeader, "base64");

  const match =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!match) {
    console.warn(chalk.red("[Error] [Webhook] HMAC verification failed."));
    console.warn("Expected:", digest);
    console.warn("Received:", hmacHeader);
    return false;
  } else {
    if (isDebug) {
      console.log(chalk.green("[Webhook] HMAC verification succeeded."));
    }
  }

  if (isDebug) {
    console.debug(chalk.green("[Webhook] HMAC-Header erhalten:"), hmacHeader);
    console.debug(
      chalk.green("[Webhook] Raw-Body erhalten:"),
      body.toString("utf8")
    );
    console.debug(chalk.green("[Webhook] Berechneter Digest:"), digest);
    console.debug(chalk.green("[Webhook] Erwarteter Buffer:"), expected);
    console.debug(chalk.green("[Webhook] Erhaltener Buffer:"), received);
  }
  return match;
}

// Webhook-Route
router.post("/orders-paid", async (req, res) => {
  if (isDebug) {
    console.log(
      chalk.green(
        "[Webhook] POST /orders-paid empfangen. Verarbeitung startet..."
      )
    );
  }

  try {
    if (!verifyShopifyWebhook(req)) {
      console.error(
        chalk.red(
          "[Error] [Webhook] Anfrage abgelehnt: HMAC-Überprüfung fehlgeschlagen."
        )
      );
      return res.status(401).send("Nicht autorisiert");
    }

    let orderData;
    try {
      const parsedPayload = JSON.parse(req.rawBody.toString("utf8"));
      if (isDebug) {
        console.log(
          chalk.green("[Webhook] Webhook-Payload erfolgreich geparst:"),
          parsedPayload
        );
      }
      console.log(
        chalk.red(
          "\n************ WEBHOOK Strategie: Zahlungseingang ************"
        )
      );
      console.log(
        chalk.green(
          `[Webhook] Order #${parsedPayload.order_number} (${parsedPayload.email}) verarbeitet.`
        )
      );
      orderData = parsedPayload;
    } catch (parseError) {
      console.error(
        chalk.red("[Error] [Webhook] Fehler beim Parsen des Webhook-Bodys:"),
        parseError
      );
      return res.status(400).send("Ungültiges JSON");
    }

    if (orderData.financial_status === "paid") {
      console.log(
        chalk.green(
          '[Webhook] Zahlungsstatus ist "paid". Sende Daten an Club Manager...'
        )
      );
      try {
        await sendPaymentDataToClubManager(orderData);
        console.log(
          chalk.yellow(
            "[ClubManager] Zahlungsdaten erfolgreich an Club Manager gesendet."
          )
        );
        res.status(200).send("OK");
      } catch (clubManagerError) {
        console.error(
          chalk.red(
            "[Error] [ClubManager] Fehler beim Senden an Club Manager:"
          ),
          clubManagerError
        );
        res.status(502).send("Fehler bei Weiterleitung an Club Manager");
      }
    } else {
      console.log(
        chalk.green(
          `[Webhook] Zahlungsstatus ist nicht "paid". Aktueller Status: ${orderData.financial_status}`
        )
      );
      res.status(200).send("Zahlungsstatus nicht relevant");
    }
  } catch (error) {
    console.error(
      chalk.red(
        "[Error] [Webhook] Unerwarteter Fehler bei der Verarbeitung des webhooks:"
      ),
      error
    );
    res.status(500).send("Interner Serverfehler");
  }
});

export default router;
