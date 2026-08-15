import express from "express";
import cors from "cors";

import authRoutes from "./auth.routes.js";
import customerRoutes from "./customer.routes.js";
import productRoutes from "./product.routes.js";

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
app.use("/api/products", productRoutes);

export default app;