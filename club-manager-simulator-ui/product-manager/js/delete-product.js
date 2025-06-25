// delete-product.js

// Produktliste laden und Select-Box füllen
async function loadProducts() {
  try {
    const response = await fetch(
      "http://localhost:4000/api/product-sync/api/products"
    );
    const result = await response.json();
    const select = document.getElementById("productSelect");
    select.innerHTML = "";

    let products = [];
    if (Array.isArray(result.products)) {
      products = result.products;
    } else if (Array.isArray(result)) {
      products = result;
    } else {
      showMessage("Keine Produkte gefunden.", "error");
      return;
    }

    products.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = `${product.title} (ID: ${product.id})`;
      select.appendChild(option);
    });

    if (products.length > 0) {
      select.value = products[0].id;
      showProductInfo(products[0]);
      document.getElementById("deleteFormContainer").style.display = "block";
    }
  } catch (error) {
    showMessage("Fehler beim Laden der Produktliste.", "error");
  }
}

// Produktinfo anzeigen (zeigt alle Felder wie im Update-Formular)
function showProductInfo(product) {
  const info = document.getElementById("productInfo");
  // Felder wie im Update-Formular auflisten
  let html = `<strong>Titel:</strong> ${product.title || "-"}<br>`;
  html += `<strong>Beschreibung:</strong> ${product.body_html || "-"}<br>`;
  html += `<strong>Anbieter:</strong> ${product.vendor || "-"}<br>`;
  html += `<strong>Produkttyp:</strong> ${product.product_type || "-"}<br>`;
  html += `<strong>Tags:</strong> ${product.tags || "-"}<br>`;
  html += `<strong>Bild:</strong> ${
    product.image && product.image.src
      ? `<a href='${product.image.src}' target='_blank'>${product.image.src}</a>`
      : "-"
  }<br>`;
  if (product.variants && product.variants.length > 0) {
    html += `<strong>Varianten:</strong><ul>`;
    product.variants.forEach((variant) => {
      html += `<li>Titel: ${variant.title || "-"}, Preis: ${
        variant.price || "-"
      }, ID: ${variant.id}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<strong>Varianten:</strong> Keine<br>`;
  }
  info.innerHTML = html;
}

// Produktdetails nach Auswahl laden
async function onProductSelectChange() {
  const select = document.getElementById("productSelect");
  const productId = select.value;
  if (!productId) {
    document.getElementById("deleteFormContainer").style.display = "none";
    return;
  }
  try {
    const response = await fetch(
      `http://localhost:4000/api/product-sync/api/products/${productId}`
    );
    if (!response.ok) {
      showMessage("Produkt nicht gefunden.", "error");
      document.getElementById("deleteFormContainer").style.display = "none";
      return;
    }
    const product = await response.json();
    showProductInfo(product);
    document.getElementById("deleteFormContainer").style.display = "block";
  } catch (error) {
    showMessage("Fehler beim Laden des Produktes.", "error");
    document.getElementById("deleteFormContainer").style.display = "none";
  }
}

// Produkt löschen
async function deleteProduct() {
  const select = document.getElementById("productSelect");
  const productId = select.value;
  if (!productId) {
    showMessage("Bitte zuerst ein Produkt wählen!", "error");
    return;
  }
  if (!confirm("Möchten Sie dieses Produkt wirklich löschen?")) {
    return;
  }
  try {
    const response = await fetch(
      `http://localhost:4000/api/product-sync/api/products/${productId}`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      showMessage("✅ Produkt erfolgreich gelöscht!", "success");
      await loadProducts();
      document.getElementById("deleteFormContainer").style.display = "none";
    } else {
      showMessage("❌ Fehler beim Löschen des Produktes.", "error");
    }
  } catch (error) {
    showMessage("❌ Fehler beim Löschen.", "error");
  }
}

// Nachricht anzeigen
function showMessage(message, type) {
  const msgElem = document.getElementById("message");
  msgElem.textContent = message;
  msgElem.className = type;
}

// Event-Listener

document
  .getElementById("productSelect")
  .addEventListener("change", onProductSelectChange);
document
  .getElementById("deleteButton")
  .addEventListener("click", deleteProduct);

// Initiales Laden
loadProducts();
