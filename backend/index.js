import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

dotenv.config();
console.log("🔍 Überprüfung, ob .env existiert:", fs.existsSync("./.env"));

const app = express();
app.use(cors());
app.use(express.json());

// 👉 Unterstützung für direkten Zugriff auf JS-Dateien im /public-Verzeichnis
app.use(express.static("public"));

const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;

console.log("🧪 SHOP_DOMAIN:", SHOP_DOMAIN);

// 📌 API zum Erstellen eines Kunden (nur für die erste Phase)
app.post("/api/createCustomer", async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    phone,
    password,
    address1,
    city,
    province,
    zip,
    country,
  } = req.body;

  // Überprüfung auf fehlende Pflichtfelder
  if (!email || !firstName || !lastName || !phone || !password) {
    return res.status(400).json({
      success: false,
      error:
        "Fehlende Pflichtfelder: Vorname, Nachname, Email, Telefon, Passwort",
    });
  }

  try {
    // Anfrage an Shopify-API zum Erstellen eines Kunden
    const shopifyResponse = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2025-04/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({
          customer: {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            verified_email: true,
            password,
            password_confirmation: password,
            send_email_welcome: false,
            addresses: [
              {
                address1,
                city,
                province,
                zip,
                country,
                phone,
                first_name: firstName,
                last_name: lastName,
              },
            ],
          },
        }),
      }
    );

    const data = await shopifyResponse.json();

    // Erfolgreiche Antwort von Shopify
    if (data.customer?.id) {
      return res.status(200).json({ success: true, customer: data.customer });
    } else {
      // Fehlerhafte Antwort von Shopify
      console.error("❌ Fehlerhafte Antwort von Shopify:", data);
      return res
        .status(400)
        .json({ success: false, error: data.errors || data });
    }
  } catch (err) {
    // Fehler beim Erstellen des Kunden
    console.error("❌ Fehler beim Kunden-Erstellen:", err);
    return res
      .status(500)
      .json({ success: false, error: "Interner Serverfehler" });
  }
});

// Starten des Servers auf Port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend läuft auf http://localhost:${PORT}`);
});
