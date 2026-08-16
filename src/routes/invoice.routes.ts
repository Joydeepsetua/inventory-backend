import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import {
  cancelInvoiceController,
  createInvoiceController,
  getAllInvoicesController,
  getInvoiceByIdController,
  updateInvoicePaymentController,
} from "../controllers/invoice.controller.js";

const router = Router();

router.post("/", authenticate, createInvoiceController);
router.get("/", authenticate, getAllInvoicesController);
router.get("/:id", authenticate, getInvoiceByIdController);
router.patch("/:id/payment", authenticate, updateInvoicePaymentController);
router.patch("/:id/cancel", authenticate, cancelInvoiceController);

export default router;
