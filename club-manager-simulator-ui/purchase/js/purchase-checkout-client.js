// This script handles the checkout form submission in the browser and calls the backend API
// ...existing code from checkout-client.js...
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
    const discountCode = document.getElementById("discountCode").value.trim();
    if (!variantId) {
      alert("Bitte Variant-ID eingeben.");
      return;
    }
    try {
      const response = await fetch("/api/checkout/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          recipient,
          variantId,
          discountCode,
        }),
      });
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Fehler beim Bestellvorgang.");
      }
    } catch (err) {
      alert("Fehler beim Bestellvorgang.");
    }
  });
});
