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

  // Korrektur: images sollte ein Array von Objekten mit dem Schlüssel src sein
  console.log(chalk.green("From Utils.js: buildPayloadFromForm called"));
  console.log(chalk.red("Images:"), image);

  const payload = {
    title: title,
    description: description,
    vendor: vendor,
    product_type: product_type,
    tags: tags,
    images: image,
    pricing_groups: pricingGroups,
  };

  console.log(chalk.blue("Payload:"), {
    title,
    description,
    vendor,
    product_type,
    tags,
    image,
    pricingGroups,
  });

  return payload;
}
