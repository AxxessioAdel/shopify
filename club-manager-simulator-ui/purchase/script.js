import {
  createCart,
  addProductToCart,
  getCheckoutUrl,
} from "./checkout-handler.js";

import dotenv from "dotenv";

dotenv.config();
const CONTENT_TYPE = process.env.CONTENT_TYPE;

const isDebugLevelInfo = process.env.DEBUG_MODE === "true";
if (isDebugLevelInfo) {
  console.log("[Debug] Customer Checkout loaded with debug level info");
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();
    const recipient = document.querySelector(
      'input[name="recipient"]:checked'
    ).value;
    const variantId = document.getElementById("variantId").value.trim();

    if (!variantId) {
      alert("Bitte Variant-ID eingeben oder aus Preset auswählen.");
      return;
    }

    // 1. Kunden erstellen
    const customerResponse = await fetch(
      `http://localhost/api/createCustomer`,
      {
        method: "POST",
        headers: { "Content-Type": CONTENT_TYPE },
        body: JSON.stringify({ email, firstName: name, phone }),
      }
    );

    const customerData = await customerResponse.json();
    if (!customerData.success) {
      alert("Kunde konnte nicht erstellt werden.");
      return;
    }

    try {
      const cart = await createCart();
      await addProductToCart(cart.id, variantId, [
        { key: "Empfängername", value: name },
        { key: "Mobilnummer", value: phone },
        { key: "Grußtext", value: message },
        { key: "Für wen", value: recipient },
        { key: "E-Mail", value: email },
      ]);
      const checkoutUrl = await getCheckoutUrl(cart.id);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Fehler beim Checkout-Prozess:", err);
      alert("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
    }
  });
});
