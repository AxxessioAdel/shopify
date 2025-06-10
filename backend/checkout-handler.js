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
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": "<Access-Token>",
      },
      body: JSON.stringify({ query }),
    }
  );
  const data = await response.json();
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
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": "<Access-Token>",
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const data = await response.json();
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
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": "<Access-Token>",
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const data = await response.json();
  return data.data.cart.checkoutUrl;
}
