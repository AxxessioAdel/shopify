import {
  createCart,
  addProductToCart,
  getCheckoutUrl,
} from "./checkout-handler.js";

document.addEventListener("DOMContentLoaded", () => {
  const info = JSON.parse(localStorage.getItem("customerInfo") || "{}");
  if (info.firstName)
    document.getElementById("name").value = `${info.firstName} ${
      info.lastName || ""
    }`;
  if (info.phone) document.getElementById("phone").value = info.phone;
  if (info.email) document.getElementById("email").value = info.email;
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
      alert("Bitte Variant-ID eingeben.");
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
      console.error("Fehler beim Checkout:", err);
      alert("Fehler beim Bestellvorgang.");
    }
  });
});
