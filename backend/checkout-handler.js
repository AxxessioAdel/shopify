const CONTENT_TYPE = 'application/json';
const STOREFRONT_ACCESS_TOKEN = '6e37ff37b5f96a6df92a41f64534b90d';

export async function createCart() {
  const query = `
    mutation {
      cartCreate {
        cart {
          id
          createdAt
        }
      }
    }
  `;
  const body = JSON.stringify({ query });
  console.log("[createCart] Request body:", body);
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
      },
      body,
    }
  );
  const data = await response.json();
  if (!data.data || !data.data.cartCreate || !data.data.cartCreate.cart) {
    console.error("Shopify createCart error response:", data);
    throw new Error(
      data.errors?.[0]?.message || data.errors || "Fehler beim Erstellen des Warenkorbs (createCart)."
    );
  }
  return data.data.cartCreate.cart;
}

export async function addProductToCart(cartId, merchandiseId, attributes = []) {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    cartId,
    lines: [
      {
        merchandiseId,
        quantity: 1,
        attributes,
      },
    ],
  };
  const body = JSON.stringify({ query, variables });
  console.log("[addProductToCart] Request body:", body);
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
      },
      body,
    }
  );
  const data = await response.json();
  if (!data.data || !data.data.cartLinesAdd || !data.data.cartLinesAdd.cart) {
    console.error("Shopify addProductToCart error response:", data);
    throw new Error(
      data.errors?.[0]?.message || data.errors || "Fehler beim Hinzufügen zum Warenkorb (addProductToCart)."
    );
  }
  return data.data.cartLinesAdd.cart;
}

export async function getCheckoutUrl(cartId) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        checkoutUrl
      }
    }
  `;
  const variables = { cartId };
  const body = JSON.stringify({ query, variables });
  console.log("[getCheckoutUrl] Request body:", body);
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
      },
      body,
    }
  );
  const data = await response.json();
  if (!data.data || !data.data.cart || !data.data.cart.checkoutUrl) {
    console.error("Shopify getCheckoutUrl error response:", data);
    throw new Error(
      data.errors?.[0]?.message || data.errors || "Fehler beim Abrufen der Checkout-URL."
    );
  }
  return data.data.cart.checkoutUrl;
}
