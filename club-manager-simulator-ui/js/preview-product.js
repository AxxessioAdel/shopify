// preview-product.js

// Produkte laden und anzeigen
async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3001/api/products");
    const result = await response.json();
    let products = [];
    if (Array.isArray(result.products)) {
      products = result.products;
    } else if (Array.isArray(result)) {
      products = result;
    } else {
      showMessage("Keine Produkte gefunden.", "error");
      return;
    }
    renderProducts(products);
  } catch (error) {
    showMessage("Fehler beim Laden der Produkte.", "error");
  }
}

// Produkte rendern (wie im Update-Formular, aber nur zur Anzeige)
function renderProducts(products) {
  const list = document.getElementById("productsList");
  list.innerHTML = "";
  if (products.length === 0) {
    list.innerHTML = "<p>Keine Produkte vorhanden.</p>";
    return;
  }
  products.forEach((product) => {
    let html = `<div class='box product-box'>`;
    html += `<strong>Titel:</strong> ${product.title || "-"}<br>`;
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
    html += `</div>`;
    list.innerHTML += html;
  });
}

// Nachricht anzeigen
function showMessage(message, type) {
  const msgElem = document.getElementById("message");
  msgElem.textContent = message;
  msgElem.className = type;
}

// Initiales Laden
loadProducts();
