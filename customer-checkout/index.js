import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import checkoutRouter from "./api/checkout.js";
// Rabatt-API für automatisches Anlegen von Price Rules & Discount Codes
import discountApiRouter from "./discount-api/create-discount.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// Entfernen oder Auskommentieren des Static-Middleware für das public-Verzeichnis
// app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Statische Dateien aus dem richtigen UI-Verzeichnis für /purchase/create-customer.html bereitstellen
const staticRoot = path.join(
  __dirname,
  "../club-manager-simulator-ui/purchase"
);
console.log("[Debug] Static root:", staticRoot);
app.use(express.static(staticRoot));

// Entwicklungs-CSP-Header hinzufügen, um Inline-Styles zu erlauben (nur für lokale Tests)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src *; script-src 'self' 'unsafe-inline' *; style-src 'self' 'unsafe-inline' *"
  );
  next();
});

// checkoutRouter hinzufügen, um alle /checkout Endpunkte direkt zu aktivieren
app.use("/", checkoutRouter);
// Rabatt-API-Endpunkte unter /api/discount verfügbar machen
app.use("/api/discount", discountApiRouter);

const ADMIN_TOKEN = process.env.CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN;
const SHOP_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const CONTENT_TYPE = process.env.CONTENT_TYPE;

const isDebugLevelInfo = process.env.DEBUG_MODE === "true";
if (isDebugLevelInfo) {
  console.log("[Debug] Customer Checkout loaded with debug level info");
  console.log("[Debug] SHOP_DOMAIN:", SHOP_DOMAIN);
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
  console.log("[Debug] ADMIN_TOKEN:", ADMIN_TOKEN);
}

// 📌 API zum Erstellen oder Finden eines Kunden
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

  if (!email || !firstName || !lastName || !phone || !password) {
    return res.status(400).json({
      success: false,
      error:
        "Fehlende Pflichtfelder: Vorname, Nachname, Email, Telefon, Passwort",
    });
  }

  try {
    const searchBy = async (field, value) => {
      const searchParams = new URLSearchParams({ query: `${field}:${value}` });
      const res = await fetch(
        `https://${SHOP_DOMAIN}/admin/api/2025-04/customers/search.json?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": CONTENT_TYPE,
            "X-Shopify-Access-Token": ADMIN_TOKEN,
          },
        }
      );
      return await res.json();
    };

    // 🔍 1. Suche nach Email
    let searchData = await searchBy("email", email);

    // 🔁 2. Falls nicht gefunden → Suche nach Telefonnummer
    if (!searchData.customers || searchData.customers.length === 0) {
      searchData = await searchBy("phone", phone);
    }

    // ✅ Kunde existiert → zurückgeben mit isNew: false
    if (searchData.customers && searchData.customers.length > 0) {
      const existingCustomer = searchData.customers[0];
      console.log("ℹ️ Kunde existiert bereits:", existingCustomer.id);
      return res.status(200).json({
        success: true,
        isNew: false,
        customer: existingCustomer,
      });
    }

    // 🆕 Kunde erstellen
    const createResponse = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2025-04/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": CONTENT_TYPE,
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

    const createData = await createResponse.json();

    if (createData.customer?.id) {
      return res.status(200).json({
        success: true,
        isNew: true,
        customer: createData.customer,
      });
    } else {
      console.error("❌ Fehlerhafte Antwort von Shopify:", createData);
      return res.status(400).json({
        success: false,
        error: createData.errors || createData,
      });
    }
  } catch (err) {
    console.error("❌ Fehler im Kunden-Workflow:", err);
    return res.status(500).json({
      success: false,
      error: "Interner Serverfehler",
    });
  }
});

// Entfernen Sie die Serverstart-Logik und exportieren Sie als Router
export default app;
