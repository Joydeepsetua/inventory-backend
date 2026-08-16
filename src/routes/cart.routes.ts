import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
  addCartItemController,
  clearCartController,
  getCartController,
  removeCartItemController,
  updateCartItemController,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", authenticate, getCartController);
router.delete("/", authenticate, clearCartController);
router.post("/items", authenticate, addCartItemController);
router.put("/items/:id", authenticate, updateCartItemController);
router.delete("/items/:id", authenticate, removeCartItemController);

export default router;
