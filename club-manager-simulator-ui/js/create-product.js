// create-product.js

let latestPayload = null;

document.getElementById("addPricingGroup").addEventListener("click", () => {
  const container = document.getElementById("pricingGroupsContainer");
  const newGroup = document.createElement("div");
  newGroup.classList.add("pricingGroup", "field", "is-grouped");
  newGroup.innerHTML = `
    <div class="control">
      <label>Group Name: <input class="input group-name" type="text" required /></label>
    </div>
    <div class="control">
      <label>Price: <input class="input group-price" type="number" required /></label>
    </div>
  `;
  container.appendChild(newGroup);
});

document.getElementById("previewButton").addEventListener("click", () => {
  const payload = buildPayloadFromForm();
  latestPayload = payload;
  document.getElementById("previewOutput").textContent = JSON.stringify(
    payload,
    null,
    2
  );
  showMessage("Produktdaten erfolgreich vorbereitet. Bitte prüfen!", "success");
});

document.getElementById("sendButton").addEventListener("click", async () => {
  if (!latestPayload) {
    showMessage("Bitte zuerst Preview durchführen!", "error");
    return;
  }

  disableButtons(true);

  //   console.log("🔄 Sende Produktdaten an Webhook:", latestPayload);

  try {
    const response = await fetch("http://localhost:3002/simulate-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestPayload),
    });

    const result = await response.json();
    // console.log("✅ Webhook erfolgreich ausgelöst:", result);
    showMessage("✅ Produkt erfolgreich an Shopify übermittelt!", "success");
    document.getElementById("previewOutput").textContent = "";
    resetForm();
  } catch (error) {
    console.error("❌ Fehler beim Webhook:", error);
    showMessage("❌ Fehler beim Webhook senden.", "error");
    document.getElementById("previewOutput").textContent = "";
  } finally {
    disableButtons(false);
  }
});

function showMessage(message, type) {
  const msgElem = document.getElementById("message");
  msgElem.textContent = message;
  msgElem.className = `notification ${
    type === "success" ? "is-success" : "is-danger"
  }`;
}

function disableButtons(state) {
  document.getElementById("sendButton").disabled = state;
  document.getElementById("previewButton").disabled = state;
}

function resetForm() {
  document.getElementById("createProductForm").reset();
  document.getElementById("pricingGroupsContainer").innerHTML = `
    <div class="pricingGroup field is-grouped">
      <div class="control">
        <label>Group Name: <input class="input group-name" type="text" required /></label>
      </div>
      <div class="control">
        <label>Price: <input class="input group-price" type="number" required /></label>
      </div>
    </div>`;
  document.getElementById("previewOutput").textContent = "";
  latestPayload = null;
}

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

  const pricingGroups = [];
  document
    .querySelectorAll("#pricingGroupsContainer .pricingGroup")
    .forEach((group) => {
      const name = group.querySelector(".group-name").value;
      const price = parseFloat(group.querySelector(".group-price").value);
      if (name && !isNaN(price)) {
        pricingGroups.push({ name, price });
      }
    });

  const image = document.getElementById("image").value;

  if (!image) {
    showMessage("Image URL is required.", "error");
    return null;
  }

  //   console.log("image:", image);

  return {
    title,
    description,
    vendor,
    product_type,
    tags,
    image,
    pricing_groups: pricingGroups,
  };
}
