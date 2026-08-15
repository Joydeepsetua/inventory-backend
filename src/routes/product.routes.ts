import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  restoreProductController,
  updateProductController,
} from "../controllers/product.controller.js";

const router = Router();

router.post("/", authenticate, createProductController);
router.get("/", authenticate, getAllProductsController);
router.get("/:id", authenticate, getProductByIdController);
router.put("/:id", authenticate, updateProductController);
router.patch("/:id/restore", authenticate, restoreProductController);
router.delete("/:id", authenticate, deleteProductController);

export default router;
