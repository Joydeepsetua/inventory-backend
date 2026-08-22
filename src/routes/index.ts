import express from "express";
import cors from "cors";

import authRoutes from "./auth.routes.js";
import customerRoutes from "./customer.routes.js";
import productCategoryRoutes from "./product-category.routes.js";
import productRoutes from "./product.routes.js";
import productVariantRoutes from "./product-variant.routes.js";
import cartRoutes from "./cart.routes.js";
import invoiceRoutes from "./invoice.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import { successResponse } from "../utils/response.js";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  successResponse(res, "Billing & Inventory API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-variants", productVariantRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
