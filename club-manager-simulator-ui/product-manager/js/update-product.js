// update-product.js
// Entfernen von dotenv und Verwendung von festen Werten für PORT und CONTENT_TYPE
// import dotenv from "dotenv";
// dotenv.config();

const PORT = 4000; // Oder ein geeigneter Wert für Ihren zentralen Server
const CONTENT_TYPE = "application/json";

let latestPayload = null;
let selectedProductId = null;

async function loadProducts() {
  //   console.log("From update-product.js: buildPayloadFromForm called");
  try {
    const response = await fetch(
      `http://localhost:${PORT}/api/product-sync/api/products`
    );
    const result = await response.json();

    // console.log("API result:", result);
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

    // Wenn Produkte vorhanden sind, wähle das erste Produkt aus und lade dessen Details
    if (products.length > 0) {
      select.value = products[0].id;
      selectedProductId = products[0].id;
      loadProductDetails(selectedProductId);
    }
  } catch (error) {
    console.error("❌ Fehler beim Laden der Produkte:", error);
    showMessage("Fehler beim Laden der Produktliste.", "error");
  }
}

async function loadProductDetails(productId) {
  try {
    const response = await fetch(
      `http://localhost:${PORT}/api/product-sync/api/products/${productId}`
    );
    if (!response.ok) {
      showMessage("Produkt nicht gefunden (404).", "error");
      document.getElementById("editFormContainer").style.display = "none";
      return;
    }
    const product = await response.json();

    // console.log("🔍 API Response:", product);

    if (!product || !product.title) {
      console.error("❌ Invalid API response: Missing product data.");
      showMessage(
        "Fehler beim Laden des Produktes: Produktdaten fehlen.",
        "error"
      );
      return;
    }

    document.getElementById("title").value = product.title || "";
    document.getElementById("description").value = product.body_html || "";
    document.getElementById("vendor").value = product.vendor || "";
    document.getElementById("product_type").value = product.product_type || "";
    document.getElementById("tags").value = product.tags || "";
    document.getElementById("image").value =
      product.image && product.image.src ? product.image.src : "";

    const variantsContainer = document.getElementById("variantsContainer");
    variantsContainer.innerHTML = "";

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant) => {
        const variantDiv = document.createElement("div");
        variantDiv.classList.add("variant");
        variantDiv.innerHTML = `
              <label>Variant Title: <input type="text" value="${
                variant.title || ""
              }" data-id="${variant.id}" /></label><br />
              <label>Price: <input type="text" value="${
                variant.price || ""
              }" /></label><br />
            `;
        variantsContainer.appendChild(variantDiv);
      });
    } else {
      console.warn("⚠️ No variants found for the product.");
      showMessage("No variants found for the selected product.", "error");
    }

    document.getElementById("editFormContainer").style.display = "block";
  } catch (error) {
    console.error("❌ Fehler beim Laden des Produktes:", error);
    showMessage("Fehler beim Laden des Produktes.", "error");
  }
}

document.getElementById("productSelect").addEventListener("change", (e) => {
  selectedProductId = e.target.value;
  if (selectedProductId) {
    loadProductDetails(selectedProductId);
  } else {
    document.getElementById("editFormContainer").style.display = "none";
  }
});

document.getElementById("previewButton").addEventListener("click", () => {
  const payload = buildPayloadFromForm();
  latestPayload = payload;
  document.getElementById("previewOutput").textContent = JSON.stringify(
    payload,
    null,
    2
  );
  showMessage("Preview generiert.", "success");
});

document.getElementById("saveButton").addEventListener("click", async () => {
  if (!selectedProductId || !latestPayload) {
    showMessage("Bitte zuerst Produkt wählen und Preview generieren!", "error");
    document.getElementById("previewOutput").textContent = "";
    return;
  }

  //   console.log("🔄 Sending product update payload:", latestPayload);

  try {
    const response = await fetch(
      `http://localhost:${PORT}/api/product-sync/api/products/${selectedProductId}`,
      {
        method: "PUT",
        headers: { "Content-Type": CONTENT_TYPE },
        body: JSON.stringify(latestPayload),
      }
    );

    const result = await response.json();
    // console.log("✅ Produkt erfolgreich aktualisiert:", result);
    showMessage("✅ Produkt erfolgreich aktualisiert!", "success");
    document.getElementById("previewOutput").textContent = "";
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren:", error);
    showMessage("❌ Fehler beim Aktualisieren.", "error");
    document.getElementById("previewOutput").textContent = "";
  }
});

function buildPayloadFromForm() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const vendor = document.getElementById("vendor").value;
  const product_type = document.getElementById("product_type").value;
  const tags = document
    .getElementById("tags")
    .value.split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  const variants = [];
  const pricingGroups = document.querySelectorAll(
    "#variantsContainer .variant"
  );

  pricingGroups.forEach((group, index) => {
    const inputs = group.querySelectorAll("input[type='text']");
    const option1Input = inputs[0];
    const priceInput = inputs[1];

    if (option1Input && priceInput) {
      const option1 = option1Input.value.trim();
      const price = parseFloat(priceInput.value);
      const variantId = option1Input.dataset.id;

      if (option1 && !isNaN(price) && variantId) {
        variants.push({
          id: parseInt(variantId),
          option1: option1,
          price: price,
          position: index + 1,
        });
      } else {
        console.warn(`⚠️ Invalid data for variant at position ${index + 1}`);
        showMessage(
          `Invalid data for variant at position ${
            index + 1
          }. Please check the form.`,
          "error"
        );
      }
    } else {
      console.warn(
        `⚠️ Missing input fields for variant at position ${index + 1}`
      );
      showMessage(
        `Missing input fields for variant at position ${
          index + 1
        }. Please check the form.`,
        "error"
      );
    }
  });

  if (variants.length === 0) {
    console.error("❌ No valid variants found. Cannot proceed.");
    showMessage("No valid variants found. Please check the form.", "error");
    return null;
  }

  const image = document.getElementById("image").value;
  if (!image) {
    console.error("❌ Image URL is required.");
    showMessage("Image URL is required.", "error");
    return null;
  }

  const options = [
    {
      name: "Version",
      values: variants.map((variant) => variant.option1),
    },
  ];

  //   console.log("image:", image);

  const payload = {
    title: title,
    description: description,
    vendor: vendor,
    product_type: product_type,
    tags: tags,
    variants: variants,
    images: [{ src: image }],
    options: options,
  };

  return payload;
}

function showMessage(message, type) {
  const msgElem = document.getElementById("message");
  msgElem.textContent = message;
  msgElem.className = type;
}

// Initial load
loadProducts();
