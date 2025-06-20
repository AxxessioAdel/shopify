document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("customer-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      password: document.getElementById("password").value.trim(),
      address1: document.getElementById("address1").value.trim(),
      city: document.getElementById("city").value.trim(),
      province: document.getElementById("province").value.trim(),
      zip: document.getElementById("zip").value.trim(),
      country: document.getElementById("country").value.trim(),
    };

    try {
      const response = await fetch("http://localhost:3000/api/createCustomer", {
        method: "POST",
        headers: { "Content-Type": CONTENT_TYPE },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Daten lokal speichern
        localStorage.setItem(
          "customerInfo",
          JSON.stringify({
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            email: payload.email,
          })
        );

        // ✅ Rückmeldung anzeigen
        if (result.isNew !== undefined) {
          const message = result.isNew
            ? "✅ Kunde erfolgreich erstellt!"
            : `ℹ️ Kunde existierte bereits: ${result.customer.id}`;
          alert(message);
        } else {
          console.error("❌ Fehler: Ungültige Antwort vom Server.", result);
        }

        // Weiterleitung zur nächsten Seite
        window.location.href = "demo-purchase.html";
      } else {
        alert("❌ Fehler: " + JSON.stringify(result.error));
        console.error("Fehlerdetails:", result);
      }
    } catch (err) {
      console.error("❌ Netzwerkfehler:", err);
      alert("Verbindung zum Server fehlgeschlagen.");
    }
  });
});

const CONTENT_TYPE =
  window.ENV && window.ENV.CONTENT_TYPE
    ? window.ENV.CONTENT_TYPE
    : "application/json";
const CUSTOM_CHECKOUT_APP_TOKEN =
  window.ENV && window.ENV.CUSTOM_CHECKOUT_APP_TOKEN
    ? window.ENV.CUSTOM_CHECKOUT_APP_TOKEN
    : "6e37ff37b5f96a6df92a41f64534b90d";
