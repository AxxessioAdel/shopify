// API endpoint for handling checkout requests from the frontend
// This file runs in Node.js and can use dotenv, node-fetch, etc.
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const router = express.Router();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const CUSTOM_CHECKOUT_APP_TOKEN = process.env.CUSTOM_CHECKOUT_APP_TOKEN;

router.post("/checkout", async (req, res) => {
  try {
    const { variantId, name, email, phone, message, recipient } = req.body;
    if (!variantId)
      return res.status(400).json({ error: "variantId required" });

    // Create cart
    const cartRes = await fetch(
      "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
      {
        method: "POST",
        headers: {
          "Content-Type": CONTENT_TYPE,
          "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
        },
        body: JSON.stringify({
          query: `mutation { cartCreate { cart { id createdAt } } }`,
        }),
      }
    );
    const cartData = await cartRes.json();
    const cartId = cartData?.data?.cartCreate?.cart?.id;
    if (!cartId) return res.status(500).json({ error: "Cart creation failed" });

    // Add product to cart
    await fetch("https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
      },
      body: JSON.stringify({
        query: `mutation { cartLinesAdd(cartId: \"${cartId}\", lines: [{ merchandiseId: \"${variantId}\", attributes: [
            { key: \"Empfängername\", value: \"${name}\" },
            { key: \"Mobilnummer\", value: \"${phone}\" },
            { key: \"Grußtext\", value: \"${message}\" },
            { key: \"Für wen\", value: \"${recipient}\" },
            { key: \"E-Mail\", value: \"${email}\" }
          ] }]) { cart { id } } }`,
      }),
    });

    // Get checkout URL
    const checkoutUrlRes = await fetch(
      "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
      {
        method: "POST",
        headers: {
          "Content-Type": CONTENT_TYPE,
          "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
        },
        body: JSON.stringify({
          query: `query { cart(id: \"${cartId}\") { checkoutUrl } }`,
        }),
      }
    );
    const checkoutUrlData = await checkoutUrlRes.json();
    const checkoutUrl = checkoutUrlData?.data?.cart?.checkoutUrl;
    if (!checkoutUrl)
      return res.status(500).json({ error: "Checkout URL not found" });

    res.json({ checkoutUrl });
  } catch (err) {
    console.error("[API/checkout] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
