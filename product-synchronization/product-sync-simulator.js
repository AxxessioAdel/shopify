import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const PROVISIONING_API_URL = process.env.PROVISIONING_API_URL;

async function simulateProductSync() {
  const testPayload = {
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
      body: JSON.stringify(testPayload),
    });

    const result = await response.json();
    console.log("✅ Simulation erfolgreich:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Fehler bei der Simulation:", error);
  }
}

simulateProductSync();
