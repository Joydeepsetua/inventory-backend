import { Request, Response } from "express";

import {
  createProductCategory,
  deleteProductCategory,
  getAllProductCategories,
  getProductCategoryById,
  restoreProductCategory,
  updateProductCategory,
} from "../services/product-category.service.js";
import {
  createProductCategorySchema,
  listProductCategoriesSchema,
  productCategoryIdSchema,
  updateProductCategorySchema,
} from "../validator/product-category.validator.js";
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from "../utils/response.js";

export const createProductCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = createProductCategorySchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const category = await createProductCategory(value);

    successResponse(res, "Category created successfully", category, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create category";

    errorResponse(res, message, undefined, 400);
  }
};

export const getProductCategoryByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productCategoryIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const category = await getProductCategoryById(value.id);

    if (!category) {
      errorResponse(res, "Category not found", undefined, 404);
      return;
    }

    successResponse(res, "Category fetched successfully", category);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch category";

    errorResponse(res, message, undefined, 400);
  }
};

export const updateProductCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error: paramError, value: params } =
      productCategoryIdSchema.validate(req.params);

    if (paramError) {
      errorResponse(res, paramError.details[0].message, undefined, 400);
      return;
    }

    const { error, value } = updateProductCategorySchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const category = await updateProductCategory(params.id, value);

    if (!category) {
      errorResponse(res, "Category not found", undefined, 404);
      return;
    }

    successResponse(res, "Category updated successfully", category);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update category";

    errorResponse(res, message, undefined, 400);
  }
};

export const deleteProductCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productCategoryIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const category = await deleteProductCategory(value.id);

    if (!category) {
      errorResponse(res, "Category not found", undefined, 404);
      return;
    }

    successResponse(res, "Category deleted successfully", category);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete category";

    errorResponse(res, message, undefined, 400);
  }
};

export const restoreProductCategoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = productCategoryIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const category = await restoreProductCategory(value.id);

    if (!category) {
      errorResponse(res, "Category not found", undefined, 404);
      return;
    }

    successResponse(res, "Category restored successfully", category);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to restore category";

    errorResponse(res, message, undefined, 400);
  }
};

export const getAllProductCategoriesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = listProductCategoriesSchema.validate(req.query);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const result = await getAllProductCategories(value);

    successPaginatedResponse(res, "Categories fetched successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch categories";

    errorResponse(res, message, undefined, 400);
  }
};
