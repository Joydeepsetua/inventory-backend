import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { getDashboardSummaryController } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/summary", authenticate, getDashboardSummaryController);

export default router;
