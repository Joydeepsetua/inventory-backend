import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createProductVariantController,
  deleteProductVariantController,
  getAllProductVariantsController,
  getProductVariantByIdController,
  restoreProductVariantController,
  updateProductVariantController,
} from "../controllers/product-variant.controller.js";

const router = Router();

router.post("/", authenticate, createProductVariantController);
router.get("/", authenticate, getAllProductVariantsController);
router.get("/:id", authenticate, getProductVariantByIdController);
router.put("/:id", authenticate, updateProductVariantController);
router.patch("/:id/restore", authenticate, restoreProductVariantController);
router.delete("/:id", authenticate, deleteProductVariantController);

export default router;
