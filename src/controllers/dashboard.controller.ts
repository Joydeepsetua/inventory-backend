import { Request, Response } from "express";

import { getDashboardSummary } from "../services/dashboard.service.js";
import { dashboardSummarySchema } from "../validator/dashboard.validator.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const getDashboardSummaryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = dashboardSummarySchema.validate(req.query);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const summary = await getDashboardSummary(value);

    successResponse(res, "Dashboard summary fetched successfully", summary);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch dashboard summary";

    errorResponse(res, message, undefined, 400);
  }
};
