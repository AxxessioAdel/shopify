import fetch from "node-fetch";

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
      "http://localhost:3000/api/product-provisioning",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
