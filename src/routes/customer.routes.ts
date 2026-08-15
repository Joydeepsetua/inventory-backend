import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createCustomerController,
  deleteCustomerController,
  getAllCustomersController,
  getCustomerByIdController,
  restoreCustomerController,
  updateCustomerController,
} from "../controllers/customer.controller.js";

const router = Router();

router.post("/", authenticate, createCustomerController);
router.get("/", authenticate, getAllCustomersController);
router.get("/:id", authenticate, getCustomerByIdController);
router.put("/:id", authenticate, updateCustomerController);
router.patch("/:id/restore", authenticate, restoreCustomerController);
router.delete("/:id", authenticate, deleteCustomerController);

export default router;
