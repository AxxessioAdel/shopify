import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

// Routers from modules
import checkoutRouter from "../customer-checkout/index.js";
import productSyncRouter from "../product-synchronization/index.js";
import paymentConfirmationRouter from "./routes/paymentConfirmation.js";
import ordersPaidWebhook from "./webhooks/ordersPaidWebhook.js";
// Importiere triggerPaymentSync für AutoSync
import triggerPaymentSync from "./api/triggerPaymentSync.js";

dotenv.config();

const app = express();
const PORT = process.env.CLUB_MANAGER_PORT || 3000;
const CONTENT_TYPE = process.env.CONTENT_TYPE;
const USE_API_SYNC = process.env.USE_API_SYNC === "true";
const DEBUG_LEVEL = process.env.DEBUG_LEVEL?.trim() === "info";

// CORS support
app.use(cors());

// Raw body parser for /webhooks only
app.use(
  "/webhooks",
  express.raw({
    type: CONTENT_TYPE,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// JSON parser for all other routes
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Static serving for club-manager-simulator-ui (all subfolders)
app.use(
  "/",
  express.static(path.join(__dirname, "../club-manager-simulator-ui"))
);
if (DEBUG_LEVEL) {
  console.log(
    chalk.gray(
      `[Debug] Static root: ${path.join(
        __dirname,
        "../club-manager-simulator-ui/purchase"
      )}`
    )
  );
}

// Mount customer-checkout as /api/checkout
app.use("/api/checkout", checkoutRouter);
if (DEBUG_LEVEL) console.log(chalk.cyan("[Checkout] gestartet"));

// Mount product-synchronization as /api/product-sync
app.use("/api/product-sync", productSyncRouter);
if (DEBUG_LEVEL) console.log(chalk.cyan("[ProductSync] gestartet"));

// Mount payment confirmation as /api/payments
app.use("/api/payments", paymentConfirmationRouter);
if (DEBUG_LEVEL) console.log(chalk.cyan("[Payments] gestartet"));

// Mount webhooks
app.use("/webhooks", ordersPaidWebhook);

app.listen(PORT, () => {
  console.log(chalk.green(`[ClubManager] Server läuft auf Port ${PORT}`));
});

// === Automatische Synchronisation: Alle 60 Sekunden ausführen ===
if (USE_API_SYNC) {
  setInterval(async () => {
    console.log(
      chalk.red("\n************ API Strategie: Automatischer Sync ************")
    );
    console.log(chalk.cyan("[AutoSync] Triggering..."));
    try {
      const result = await triggerPaymentSync();
      console.log(chalk.cyan("[AutoSync] Sync result:"), result);
    } catch (err) {
      console.error(chalk.red("[Error] [AutoSync] Fehler:", err));
    }
  }, 60000);
  // === Ende der automatischen Synchronisation ===
} else {
  console.log(
    chalk.yellow("[AutoSync] API Sync ist deaktiviert (USE_API_SYNC=false)")
  );
}
