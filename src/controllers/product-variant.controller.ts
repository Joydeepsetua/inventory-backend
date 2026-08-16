import { Request, Response } from "express";

import {
  createProductVariant,
  deleteProductVariant,
  getAllProductVariants,
  getProductVariantById,
  restoreProductVariant,
  updateProductVariant,
} from "../services/product-variant.service.js";
import {
  createProductVariantSchema,
  listProductVariantsSchema,
  productVariantIdSchema,
  updateProductVariantSchema,
} from "../validator/product-variant.validator.js";
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from "../utils/response.js";

export const createProductVariantController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = createProductVariantSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const variant = await createProductVariant(value);

    successResponse(res, "Variant created successfully", variant, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create variant";

    errorResponse(res, message, undefined, 400);
  }
};

export const getProductVariantByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productVariantIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const variant = await getProductVariantById(value.id);

    if (!variant) {
      errorResponse(res, "Variant not found", undefined, 404);
      return;
    }

    successResponse(res, "Variant fetched successfully", variant);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch variant";

    errorResponse(res, message, undefined, 400);
  }
};

export const updateProductVariantController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error: paramError, value: params } =
      productVariantIdSchema.validate(req.params);

    if (paramError) {
      errorResponse(res, paramError.details[0].message, undefined, 400);
      return;
    }

    const { error, value } = updateProductVariantSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const variant = await updateProductVariant(params.id, value);

    if (!variant) {
      errorResponse(res, "Variant not found", undefined, 404);
      return;
    }

    successResponse(res, "Variant updated successfully", variant);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update variant";

    errorResponse(res, message, undefined, 400);
  }
};

export const deleteProductVariantController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productVariantIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const variant = await deleteProductVariant(value.id);

    if (!variant) {
      errorResponse(res, "Variant not found", undefined, 404);
      return;
    }

    successResponse(res, "Variant deleted successfully", variant);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete variant";

    errorResponse(res, message, undefined, 400);
  }
};

export const restoreProductVariantController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productVariantIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const variant = await restoreProductVariant(value.id);

    if (!variant) {
      errorResponse(res, "Variant not found", undefined, 404);
      return;
    }

    successResponse(res, "Variant restored successfully", variant);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to restore variant";

    errorResponse(res, message, undefined, 400);
  }
};

export const getAllProductVariantsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = listProductVariantsSchema.validate(req.query);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const result = await getAllProductVariants(value);

    successPaginatedResponse(res, "Variants fetched successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch variants";

    errorResponse(res, message, undefined, 400);
  }
};
