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
  const image = document.getElementById("image").value;

  const pricingGroups = [];
  document.querySelectorAll(".pricingGroup").forEach((group) => {
    const name = group.querySelector(".group-name").value;
    const price = group.querySelector(".group-price").value;
    if (name && price) {
      pricingGroups.push({
        name: name,
        price: price,
      });
    }
  });

  const payload = {
    title: title,
    description: description,
    vendor: vendor,
    product_type: product_type,
    tags: tags,
    images: [image],
    pricing_groups: pricingGroups,
  };

  return payload;
}
