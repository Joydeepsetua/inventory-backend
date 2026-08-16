import { Response } from "express";

import {
  addItemToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/cart.service.js";
import {
  addCartItemSchema,
  cartItemIdSchema,
  updateCartItemSchema,
} from "../validator/cart.validator.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { AuthenticatedRequest } from "../interfaces/cart.interface.js";

export const getCartController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const cart = await getCart(req.user!.id);

    successResponse(res, "Cart fetched successfully", cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch cart";

    errorResponse(res, message, undefined, 400);
  }
};

export const addCartItemController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = addCartItemSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const cart = await addItemToCart(req.user!.id, value);

    successResponse(res, "Item added to cart", cart, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to add item to cart";

    errorResponse(res, message, undefined, 400);
  }
};

export const updateCartItemController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { error: paramError, value: params } = cartItemIdSchema.validate(
      req.params
    );

    if (paramError) {
      errorResponse(res, paramError.details[0].message, undefined, 400);
      return;
    }

    const { error, value } = updateCartItemSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const cart = await updateCartItem(req.user!.id, params.id, value);

    if (!cart) {
      errorResponse(res, "Cart item not found", undefined, 404);
      return;
    }

    successResponse(res, "Cart item updated", cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update cart item";

    errorResponse(res, message, undefined, 400);
  }
};

export const removeCartItemController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = cartItemIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const cart = await removeCartItem(req.user!.id, value.id);

    if (!cart) {
      errorResponse(res, "Cart item not found", undefined, 404);
      return;
    }

    successResponse(res, "Cart item removed", cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to remove cart item";

    errorResponse(res, message, undefined, 400);
  }
};

export const clearCartController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const cart = await clearCart(req.user!.id);

    successResponse(res, "Cart cleared", cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to clear cart";

    errorResponse(res, message, undefined, 400);
  }
};
