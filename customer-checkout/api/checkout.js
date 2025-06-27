// API endpoint for handling checkout requests from the frontend
// This file runs in Node.js and can use dotenv, node-fetch, etc.
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import {
  createCart,
  addProductToCart,
  getCheckoutUrl,
  applyDiscountToCart,
  getCart,
} from "../checkout-handler.js";
dotenv.config();

const router = express.Router();
const isDebugDiscount = process.env.DEBUG_DISCOUNT === "true";
const CONTENT_TYPE = process.env.CONTENT_TYPE;
const CUSTOM_CHECKOUT_APP_TOKEN = process.env.CUSTOM_CHECKOUT_APP_TOKEN;

router.post("/checkout", async (req, res) => {
  try {
    const { variantId, name, email, phone, message, recipient, discountCode } =
      req.body;
    if (!variantId)
      return res.status(400).json({ error: "variantId required" });

    // Verwendung von Handler-Funktionen
    const cart = await createCart();
    if (discountCode) {
      await applyDiscountToCart(cart.id, discountCode);
      await getCart(cart.id);
    }
    await addProductToCart(cart.id, variantId, [
      { key: "Empfängername", value: name },
      { key: "Mobilnummer", value: phone },
      { key: "Grußtext", value: message },
      { key: "Für wen", value: recipient },
      { key: "E-Mail", value: email },
    ]);

    const checkoutUrl = await getCheckoutUrl(cart.id);
    if (isDebugDiscount) {
      console, log("*** From Checkout Handler ***");
      console.log("[Debug] Checkout URL:", checkoutUrl);
      console.log("[Debug] Cart ID:", cart.id);
    }
    res.json({ checkoutUrl });
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Fehler beim Bestellvorgang." });
  }
});

export default router;
