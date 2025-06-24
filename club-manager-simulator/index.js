import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import paymentConfirmation from "./routes/paymentConfirmation.js";

dotenv.config();
const app = express();

// Lade Umgebungsvariablen
const PORT = process.env.CLUB_MANAGER_PORT;
const PROVISIONING_API_URL = process.env.PROVISIONING_API_URL;
const CONTENT_TYPE = process.env.CONTENT_TYPE;

const isDebugLevelInfo = process.env.DEBUG_LEVEL === "info";
if (isDebugLevelInfo) {
  console.log("[Debug] Club Manager Simulator loaded with debug level info");
  console.log("[Debug] PORT:", PORT);
  console.log("[Debug] PROVISIONING_API_URL:", PROVISIONING_API_URL);
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
}

// CORS-Unterstützung
app.use(cors());

// 🟢 Raw body parser MUSS vor dem JSON-Parser kommen
app.use(
  "/webhooks",
  express.raw({
    type: CONTENT_TYPE,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Dann regulärer JSON-Parser für alles andere
app.use(express.json());

// Routen
app.use("/api", paymentConfirmation);

// Webhook-Handler immer aktivieren
import("./webhooks/ordersPaidWebhook.js").then(
  ({ default: ordersPaidWebhook }) => {
    app.use("/webhooks", ordersPaidWebhook);
    console.log(chalk.green("[Webhook] gestartet und Route aktiviert."));
  }
);

// API-Endpunkt für manuelles Auslösen der Zahlungssynchronisation
import("./api/triggerPaymentSync.js").then(({ default: triggerSync }) => {
  app.get("/sync/payments", async (req, res) => {
    const result = await triggerSync();
    res.status(200).json(result);
  });

  // === Automatische Synchronisation: Alle 60 Sekunden ausführen ===

  console.log(chalk.cyan("[AutoSync] gestartet (Intervall 60s)"));
  setInterval(async () => {
    console.log(
      chalk.red("\n************ API Strategie: Automatischer Sync ************")
    );
    console.log(chalk.cyan("[AutoSync] Triggering..."));
    try {
      const result = await triggerSync();
      console.log(chalk.cyan("[AutoSync] Sync result:"), result);
    } catch (err) {
      console.error(chalk.red("[Error] [AutoSync] Fehler:", err));
    }
  }, 60000);
  // === Ende der automatischen Synchronisation ===
});

// Simulationsroute für Testzwecke
app.post("/simulate-webhook", async (req, res) => {
  const payload = {
    title: "Autogrammkarte Messi",
    description: "Limitierte Auflage",
    vendor: "FC Barcelona",
    product_type: "Autogrammkarte",
    tags: ["Autogramm", "Deluxe", "Messi"],
    images: [
      {
        src: "https://res.cloudinary.com/dhrq96tlr/image/upload/v1749979271/box_dejf0a.png",
        alt: "Autogrammkarte Messi",
      },
    ],
    pricing_groups: [
      { name: "Standard", price: "29.99" },
      { name: "Deluxe", price: "59.99" },
    ],
  };

  try {
    const response = await fetch(PROVISIONING_API_URL, {
      method: "POST",
      headers: { "Content-Type": CONTENT_TYPE },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(chalk.green("[Webhook] Webhook erfolgreich gesendet:"), result);
    res.status(200).json(result);
  } catch (error) {
    console.error(
      chalk.red("[Error] Fehler beim Senden des Webhooks:", error.message)
    );
    res.status(500).json({ error: "Fehler bei der Webhook-Simulation" });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(
    chalk.yellow(
      `✅ [ClubManager] Club Manager Simulator läuft auf http://localhost:${PORT}`
    )
  );
});
