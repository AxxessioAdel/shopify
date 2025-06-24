import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.CUSTOM_CHECKOUT_PORT;
const CONTENT_TYPE = process.env.CONTENT_TYPE;

const isDebugLevelInfo = process.env.DEBUG_LEVEL === "info";
if (isDebugLevelInfo) {
  console.log(
    "[Debug] Customer Checkout Test Simulator loaded with debug level info"
  );
  console.log("[Debug] PORT:", PORT);
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
}

async function simulateProductProvisioning() {
  const testPayload = {
    title: "Autogrammkarte Messi",
    description: "Limitierte Auflage",
    vendor: "FC Barcelona",
    product_type: "Autogrammkarte",
    tags: ["Autogramm", "Deluxe", "Messi"],
    image: "https://example.com/image.jpg",
    pricing_groups: [
      { name: "Standard", price: "29.99" },
      { name: "Deluxe", price: "59.99" },
    ],
  };

  try {
    const response = await fetch(
      `http://localhost:${PORT}/api/product-provisioning`,
      {
        method: "POST",
        headers: { "Content-Type": CONTENT_TYPE },
        body: JSON.stringify(testPayload),
      }
    );

    const result = await response.json();
    console.log("✅ Simulation erfolgreich:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Fehler bei der Simulation:", error);
  }
}

simulateProductProvisioning();
