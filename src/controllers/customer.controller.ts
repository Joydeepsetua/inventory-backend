import { Request, Response } from "express";

import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  restoreCustomer,
  updateCustomer,
} from "../services/customer.service.js";
import {
  createCustomerSchema,
  customerIdSchema,
  listCustomersSchema,
  updateCustomerSchema,
} from "../validator/customer.validator.js";
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from "../utils/response.js";

export const createCustomerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = createCustomerSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const customer = await createCustomer(value);

    successResponse(res, "Customer created successfully", customer, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create customer";

    errorResponse(res, message, undefined, 400);
  }
};

export const getCustomerByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = customerIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const customer = await getCustomerById(value.id);

    if (!customer) {
      errorResponse(res, "Customer not found", undefined, 404);
      return;
    }

    successResponse(res, "Customer fetched successfully", customer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch customer";

    errorResponse(res, message, undefined, 400);
  }
};

export const updateCustomerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error: paramError, value: params } = customerIdSchema.validate(
      req.params
    );

    if (paramError) {
      errorResponse(res, paramError.details[0].message, undefined, 400);
      return;
    }

    const { error, value } = updateCustomerSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const customer = await updateCustomer(params.id, value);

    if (!customer) {
      errorResponse(res, "Customer not found", undefined, 404);
      return;
    }

    successResponse(res, "Customer updated successfully", customer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update customer";

    errorResponse(res, message, undefined, 400);
  }
};

export const deleteCustomerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = customerIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const customer = await deleteCustomer(value.id);

    if (!customer) {
      errorResponse(res, "Customer not found", undefined, 404);
      return;
    }

    successResponse(res, "Customer deleted successfully", customer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete customer";

    errorResponse(res, message, undefined, 400);
  }
};

export const restoreCustomerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = customerIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const customer = await restoreCustomer(value.id);

    if (!customer) {
      errorResponse(res, "Customer not found", undefined, 404);
      return;
    }

    successResponse(res, "Customer restored successfully", customer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to restore customer";

    errorResponse(res, message, undefined, 400);
  }
};

export const getAllCustomersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = listCustomersSchema.validate(req.query);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const result = await getAllCustomers(value);

    successPaginatedResponse(res, "Customers fetched successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch customers";

    errorResponse(res, message, undefined, 400);
  }
};
