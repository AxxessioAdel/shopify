# Shopify Product Provisioning & Checkout Headless Integration

---

This project provides a complete headless integration between Club Manager, Shopify, and a web frontend.

It consists of two independent modules:

1️⃣ **Product Provisioning Service (Integration Backend)**

- Automatically creates products in Shopify based on webhooks from Club Manager.

2️⃣ **Customer Checkout Service (Customer Checkout Backend)**

- End-to-end test environment for customer creation, cart handling, and checkout process via Storefront API.

---

## 📦 Repository Overview

```
git@github.com:AxxessioAdel/shopify.git
```

---

## ⚙️ System Overview

- Headless Shopify integration via Admin API (Product Provisioning).
- Shopify Storefront API for checkout demo.
- Webhook-based product synchronization via Club Manager.
- Separate backends for provisioning and checkout.
- Local simulation capabilities via Club Manager Simulator.

---

## 📋 Prerequisites

- Node.js v18+ (required for ESModules and node-fetch).
- A Shopify store (minimum Basic Plan).
- Access to Shopify Admin API with the following permissions:
  - Products (read and write).
  - Product Variants (read and write).
- Club Manager access (for future live integration).
- ngrok (for Webhook Public Deployment).
- Git.

---

## 🔧 Project Structure

```
project-root/
│ .gitignore
│ package.json (main directory for meta management)
│
├───customer-checkout-backend/
│ └── (Checkout Flow via Storefront API)
│
├───integration-backend/
│ └── (Shopify Product Provisioning Service)
│ ├── index.js
│ ├── shopify-product-sync.js
│ ├── product-sync-simulator.js
│ └── .env
│
├───club-manager-simulator/
│ └── (Local Webhook Test Environment)
│ ├── index.js
│ └── .env
│
├───club-manager-simulator-ui/
│ └── (Frontend for Product Management)
│ ├── create-product.html
│ ├── update-product.html
│ ├── js/
│ │ ├── api-client.js
│ │ └── utils.js
│ └── index.html
│
└───public/
└── (Frontend Demo for Customer Creation and Purchase)
```

---

## 🛠 Installation & Setup

### 1️⃣ Basic Installation per Service

Navigate to the respective subdirectories and run:

```bash
npm install
```

**Note:** Each service has its own `package.json`.

### 2️⃣ Configure `.env` Files

#### integration-backend/.env

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_xxx
```

#### club-manager-simulator/.env

```
PROVISIONING_API_URL=http://localhost:3001/api/product-provisioning
CLUB_MANAGER_PORT=3002
```

---

## 🚀 Local Startup Sequence

1️⃣ Start Integration Backend:

```bash
cd integration-backend
node index.js
```

2️⃣ Start Club Manager Simulator:

```bash
cd club-manager-simulator
node index.js
```

3️⃣ Trigger Test Webhooks:

```bash
Invoke-WebRequest -Method POST http://localhost:3002/simulate-webhook
```

---

## 🌐 Webhook Public Deployment & Live Integration

### Goal

The Product Provisioning Service must be publicly accessible for Club Manager to trigger webhooks whenever a pricing group is saved.

---

### 1️⃣ Local Deployment with ngrok (for Integration Tests & Demo)

#### a) ngrok Setup

- Install ngrok: [https://ngrok.com/download](https://ngrok.com/download).
- Authenticate your account:

```bash
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

#### b) Start ngrok Tunnel

```bash
ngrok http 3001
```

ngrok generates a public URL, e.g.:

```
https://abcd-1234.ngrok-free.app
```

#### c) Webhook Endpoint for Club Manager

This endpoint is provided to Club Manager:

```
https://abcd-1234.ngrok-free.app/api/product-provisioning
```

---

## 🧭 Architecture Overview

### End-to-End Workflow

```
Club Manager → Webhook → Product Provisioning Service → Shopify Admin API → Shopify Store
```

### Detailed Flow

1️⃣ **Product Management in Club Manager**

- Pricing group is saved.
- Webhook is triggered.

2️⃣ **Webhook Reception**

- Club Manager sends product data via webhook to the Product Provisioning Service.

3️⃣ **Product Synchronization**

- The Product Provisioning Service transforms the data into Shopify Admin API format.
- Product is created in Shopify, including variants, tags, and images.

4️⃣ **Product Live in Store**

- Products appear immediately in the Shopify store.
- Customers can purchase them instantly.

---

## 🛠 Club Manager Simulator UI

### Features

1️⃣ **Create Products**

- A user-friendly interface for creating new products.
- Supports adding product details, variants, and tags.
- Sends data to the backend for Shopify Admin API integration.

2️⃣ **Update Products**

- Allows editing existing products.
- Dynamically loads product details, including variants.
- Supports previewing changes before updating.

---

## 🔒 Security & Error Handling

- Extensive input validation in provisioning services.
- Faulty webhooks return standardized error responses.
- Secure access to Shopify Admin API via API token.

---

## 🔒 Sensitive Information Replacement

To prevent data leakage, sensitive tokens have been replaced in the project as follows:

- `STOREFRONT_ACCESS_TOKEN` → `<STOREFRONT_ACCESS_TOKEN>`
- `CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN` → `<CUSTOM_CHECKOUT_APP_ADMIN_API_TOKEN>`
- `PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN` → `<PRODUCT_PROVISIONING_SERVICE_ADMIN_API_TOKEN>`

These placeholders are used throughout the project files. For access to the actual tokens, please contact Adel Ahmadi at:
✉️ adel.ahmadi.informatiker@gmail.com

---

## 🏗 Future Expansion

- Webhook retry mechanisms for increased reliability.
- Product updates: Modify existing products when changes occur in Club Manager.
- Preview mode: Create products in draft mode and publish later.
- Monitoring & logging: Enhanced logic for better oversight.

---

## 🚀 Deployment Roadmap for Production Environment

- Deployment on dedicated servers (e.g., Hetzner Cloud, AWS Lightsail).
- Static public DNS instead of ngrok for permanent accessibility.
- CI/CD pipeline via GitHub Actions for automated releases.
- Secrets management for API tokens (e.g., AWS Secrets Manager, HashiCorp Vault).
