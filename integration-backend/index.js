// integration-backend/index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { handleProductSync } from "./shopify-product-sync.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/product-provisioning", handleProductSync);

const PORT = process.env.INTEGRATION_BACKEND_PORT;

app.listen(PORT, () => {
  console.log(
    `✅ Product Provisioning Service läuft auf http://localhost:${PORT}`
  );
});
