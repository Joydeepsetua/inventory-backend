import { Request, Response } from "express";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  restoreProduct,
  updateProduct,
} from "../services/product.service.js";
import {
  createProductSchema,
  listProductsSchema,
  productIdSchema,
  updateProductSchema,
} from "../validator/product.validator.js";
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from "../utils/response.js";

export const createProductController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = createProductSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const product = await createProduct(value);

    successResponse(res, "Product created successfully", product, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create product";

    errorResponse(res, message, undefined, 400);
  }
};

export const getProductByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const product = await getProductById(value.id);

    if (!product) {
      errorResponse(res, "Product not found", undefined, 404);
      return;
    }

    successResponse(res, "Product fetched successfully", product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch product";

    errorResponse(res, message, undefined, 400);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error: paramError, value: params } = productIdSchema.validate(
      req.params
    );

    if (paramError) {
      errorResponse(res, paramError.details[0].message, undefined, 400);
      return;
    }

    const { error, value } = updateProductSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const product = await updateProduct(params.id, value);

    if (!product) {
      errorResponse(res, "Product not found", undefined, 404);
      return;
    }

    successResponse(res, "Product updated successfully", product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update product";

    errorResponse(res, message, undefined, 400);
  }
};

export const deleteProductController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const product = await deleteProduct(value.id);

    if (!product) {
      errorResponse(res, "Product not found", undefined, 404);
      return;
    }

    successResponse(res, "Product deleted successfully", product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete product";

    errorResponse(res, message, undefined, 400);
  }
};

export const restoreProductController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const product = await restoreProduct(value.id);

    if (!product) {
      errorResponse(res, "Product not found", undefined, 404);
      return;
    }

    successResponse(res, "Product restored successfully", product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to restore product";

    errorResponse(res, message, undefined, 400);
  }
};

export const getAllProductsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = listProductsSchema.validate(req.query);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const result = await getAllProducts(value);

    successPaginatedResponse(res, "Products fetched successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch products";

    errorResponse(res, message, undefined, 400);
  }
};
