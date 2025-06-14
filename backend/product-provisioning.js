import dotenv from "dotenv";
dotenv.config();

export async function handleProductProvisioning(req, res) {
  try {
    const productPayload = req.body;
    console.log("✅ Produktdaten empfangen:", JSON.stringify(productPayload, null, 2));

    // Map Club Manager payload to Shopify Product API structure
    const shopifyProduct = {
      product: {
        title: productPayload.title || productPayload.name || "Neues Produkt",
        body_html: productPayload.description || "",
        vendor: productPayload.vendor || "Club Manager",
        product_type: productPayload.type || "",
        tags: productPayload.tags || [],
        variants: productPayload.variants || [
          {
            price: productPayload.price || "0.00",
            sku: productPayload.sku || undefined,
            inventory_quantity: productPayload.inventory_quantity || 0,
          },
        ],
        images: productPayload.images ? productPayload.images.map(url => ({ src: url })) : [],
      },
    };

    // Send product to Shopify Admin REST API
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2025-04/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN,
        },
        body: JSON.stringify(shopifyProduct),
      }
    );
    const shopifyResult = await response.json();
    console.log("✅ Shopify Antwort:", JSON.stringify(shopifyResult, null, 2));

    if (response.ok && shopifyResult.product && shopifyResult.product.id) {
      return res.status(201).json({
        message: "Produkt erfolgreich in Shopify erstellt.",
        shopifyProductId: shopifyResult.product.id,
      });
    } else {
      return res.status(400).json({
        error: shopifyResult.errors || shopifyResult,
      });
    }
  } catch (error) {
    console.error("❌ Fehler beim Empfangen oder Erstellen des Produkts:", error);
    return res.status(500).json({ error: "Interner Serverfehler beim Empfangen oder Erstellen des Produkts." });
  }
}
