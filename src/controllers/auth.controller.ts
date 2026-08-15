import { Request, Response } from "express";

import { login } from "../services/auth.service.js";
import { loginSchema } from "../validator/auth.validator.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const result = await login(value);

    successResponse(res, "Login successful", result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to login";

    errorResponse(res, message, undefined, 401);
  }
};
