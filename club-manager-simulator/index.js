import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const app = express();
app.use(express.json());

// Konfiguration für Zielendpoint
const PROVISIONING_API_URL =
  process.env.PROVISIONING_API_URL ||
  "http://localhost:3001/api/product-provisioning";

// Route zur manuellen Webhook-Simulation
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(
      "✅ Webhook erfolgreich gesendet:",
      JSON.stringify(result, null, 2)
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Fehler beim Senden des Webhooks:", error);
    res.status(500).json({ error: "Fehler bei der Webhook-Simulation" });
  }
});

const PORT = process.env.CLUB_MANAGER_PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Club Manager Simulator läuft auf http://localhost:${PORT}`);
});
