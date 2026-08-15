import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createProductCategoryController,
  deleteProductCategoryController,
  getAllProductCategoriesController,
  getProductCategoryByIdController,
  restoreProductCategoryController,
  updateProductCategoryController,
} from "../controllers/product-category.controller.js";

const router = Router();

router.post("/", authenticate, createProductCategoryController);
router.get("/", authenticate, getAllProductCategoriesController);
router.get("/:id", authenticate, getProductCategoryByIdController);
router.put("/:id", authenticate, updateProductCategoryController);
router.patch("/:id/restore", authenticate, restoreProductCategoryController);
router.delete("/:id", authenticate, deleteProductCategoryController);

export default router;
