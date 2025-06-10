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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Kunde erfolgreich erstellt!");
        window.location.href = "demo-purchase.html"; // Weiterleitung zur nächsten Seite
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
