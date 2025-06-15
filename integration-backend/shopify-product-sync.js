import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

export async function handleProductSync(req, res) {
  try {
    const productPayload = req.body;
    console.log(
      "✅ Produktdaten empfangen:",
      JSON.stringify(productPayload, null, 2)
    );

    // Input Validation
    const requiredFields = [
      "title",
      "description",
      "vendor",
      "product_type",
      "tags",
      "images",
      "pricing_groups",
    ];
    for (const field of requiredFields) {
      if (!productPayload[field]) {
        console.error(`❌ Fehlendes Feld: ${field}`);
        return res.status(400).json({
          status: "error",
          message: `Missing required field: ${field}`,
        });
      }
    }

    if (
      !Array.isArray(productPayload.images) ||
      productPayload.images.length === 0 ||
      !productPayload.images[0].src
    ) {
      console.error("❌ Ungültige Images-Daten");
      return res.status(400).json({
        status: "error",
        message:
          "Invalid images data. At least one image with a src is required.",
      });
    }

    if (
      !Array.isArray(productPayload.pricing_groups) ||
      productPayload.pricing_groups.length === 0
    ) {
      console.error("❌ Keine Pricing Groups definiert");
      return res.status(400).json({
        status: "error",
        message: "No pricing groups provided.",
      });
    }

    // Data Mapping für Shopify
    console.log("🔄 Mapping Produktdaten für Shopify...");
    // Print all productPayload features in Terminal
    console.log("📦 Alle Produkt-Features:");
    Object.entries(productPayload).forEach(([key, value]) => {
      console.log(`- ${key}:`, value);
    });

    const mappedProduct = {
      product: {
        title: productPayload.title,
        body_html: productPayload.description,
        vendor: productPayload.vendor,
        product_type: productPayload.product_type,
        tags: productPayload.tags.join(", "),
        status: "active",
        options: [
          {
            name: "Version",
            values: productPayload.pricing_groups.map((pg) => pg.name),
          },
        ],
        variants: productPayload.pricing_groups.map((pg) => ({
          option1: pg.name,
          price: pg.price,
        })),
        images: [{ src: productPayload.images[0].src }],
      },
    };

    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const shopifyToken =
      process.env.PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN;

    const response = await fetch(
      `https://${shopifyDomain}/admin/api/2025-04/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyToken,
        },
        body: JSON.stringify(mappedProduct),
      }
    );

    const shopifyResult = await response.json();

    if (response.ok) {
      console.log(
        "✅ Produkt erfolgreich erstellt:",
        JSON.stringify(shopifyResult, null, 2)
      );
      return res.status(201).json({
        status: "success",
        shopify_product_id: shopifyResult.product.id,
        shopify_product_handle: shopifyResult.product.handle,
        created_at: shopifyResult.product.created_at,
      });
    } else {
      console.error(
        "❌ Shopify Fehler:",
        JSON.stringify(shopifyResult, null, 2)
      );
      return res.status(500).json({
        status: "error",
        message: "Shopify API error",
        details: shopifyResult,
      });
    }
  } catch (error) {
    console.error("❌ Interner Fehler:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      details: error.message,
    });
  }
}
