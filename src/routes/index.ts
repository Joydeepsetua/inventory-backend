import express from "express";
import cors from "cors";

import authRoutes from "./auth.routes.js";
import customerRoutes from "./customer.routes.js";
import productCategoryRoutes from "./product-category.routes.js";
import productRoutes from "./product.routes.js";
import productVariantRoutes from "./product-variant.routes.js";
import cartRoutes from "./cart.routes.js";
import invoiceRoutes from "./invoice.routes.js";

const app = express();

app.use(cors());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', '*'],
  allowedHeaders: ['Content-Type', '*']
}));
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-variants", productVariantRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/invoices", invoiceRoutes);

export default app;