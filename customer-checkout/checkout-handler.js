import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

const CONTENT_TYPE = process.env.CONTENT_TYPE;
const CUSTOM_CHECKOUT_APP_TOKEN = process.env.CUSTOM_CHECKOUT_APP_TOKEN;
const isDebugLevelInfo = process.env.DEBUG_MODE === "true";
const isDebugDiscount = process.env.DEBUG_DISCOUNT === "true";
if (isDebugLevelInfo) {
  console.log("[Debug] Shopify API Client loaded with debug level info");
  console.log("[Debug] CONTENT_TYPE:", CONTENT_TYPE);
  console.log("[Debug] CUSTOM_CHECKOUT_APP_TOKEN:", CUSTOM_CHECKOUT_APP_TOKEN);
}

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
  if (isDebugLevelInfo) {
    console.log("[createCart] Sending request to Shopify API");
    console.log("[createCart] Request body:", body);
  }
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
      },
      body,
    }
  );
  const data = await response.json();
  if (!data.data || !data.data.cartCreate || !data.data.cartCreate.cart) {
    console.error("Shopify createCart error response:", data);
    throw new Error(
      data.errors?.[0]?.message ||
        data.errors ||
        "Fehler beim Erstellen des Warenkorbs (createCart)."
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
  if (isDebugLevelInfo) {
    console.log("[addProductToCart] Request body:", body);
  }
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
      },
      body,
    }
  );
  const data = await response.json();
  if (!data.data || !data.data.cartLinesAdd || !data.data.cartLinesAdd.cart) {
    console.error("Shopify addProductToCart error response:", data);
    throw new Error(
      data.errors?.[0]?.message ||
        data.errors ||
        "Fehler beim Hinzufügen zum Warenkorb (addProductToCart)."
    );
  }
  return data.data.cartLinesAdd.cart;
}

export async function getCheckoutUrl(cartId) {
  // Standardfall: Nur checkoutUrl aus dem Cart abfragen
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        checkoutUrl
      }
    }
  `;
  const variables = { cartId };
  const body = JSON.stringify({ query, variables });
  if (isDebugLevelInfo) {
    console.log("[getCheckoutUrl] Request body:", body);
  }
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
      },
      body,
    }
  );
  const data = await response.json();
  if (!data.data || !data.data.cart || !data.data.cart.checkoutUrl) {
    console.error("Shopify getCheckoutUrl error response:", data);
    throw new Error(
      data.errors?.[0]?.message ||
        data.errors ||
        "Fehler beim Abrufen der Checkout-URL."
    );
  }
  return data.data.cart.checkoutUrl;
}

export async function applyDiscountToCart(cartId, discountCode) {
  const query = `
    mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
      cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart {
          id
          discountCodes {
            code
            applicable
          }
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
    discountCodes: [discountCode],
  };
  const body = JSON.stringify({ query, variables });
  if (isDebugLevelInfo) {
    console.log("[applyDiscountToCart] Request body:", body);
  }
  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
      },
      body,
    }
  );
  const data = await response.json();
  if (!data.data || !data.data.cartDiscountCodesUpdate) {
    console.error("Shopify applyDiscountToCart error response:", data);
    throw new Error(
      data.errors?.[0]?.message ||
        data.errors ||
        "Fehler beim Anwenden des Gutscheincodes."
    );
  }
  // Logge die vollständige Antwort nur wenn Debug für Discount aktiv ist
  if (isDebugDiscount) {
    console.log("[Discount][Raw Response]", JSON.stringify(data, null, 2));
  }
  const errors = data.data.cartDiscountCodesUpdate.userErrors;
  if (isDebugDiscount && errors && errors.length > 0) {
    console.error("[Discount] Fehler beim Anwenden des Codes:", errors);
  } else if (isDebugDiscount) {
    console.log(
      "[Discount] Erfolgreich angewendeter Code:",
      data.data.cartDiscountCodesUpdate.cart.discountCodes
    );
  }
  return data.data.cartDiscountCodesUpdate;
}

export async function getCart(cartId) {
  const query = `
    query getCart($id: ID!) {
      cart(id: $id) {
        id
        discountCodes {
          code
          applicable
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;
  const body = JSON.stringify({ query, variables: { id: cartId } });

  const response = await fetch(
    "https://vrr7x3-ab.myshopify.com/api/2024-04/graphql.json",
    {
      method: "POST",
      headers: {
        "Content-Type": CONTENT_TYPE,
        "X-Shopify-Storefront-Access-Token": CUSTOM_CHECKOUT_APP_TOKEN,
      },
      body,
    }
  );

  const data = await response.json();
  if (isDebugDiscount) {
    console.log("[Cart][State after discount]", JSON.stringify(data, null, 2));
  }
  return data;
}
