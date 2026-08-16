import { Request, Response } from "express";

import {
  cancelInvoice,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoicePayment,
} from "../services/invoice.service.js";
import {
  createInvoiceSchema,
  invoiceIdSchema,
  listInvoicesSchema,
  updateInvoicePaymentSchema,
} from "../validator/invoice.validator.js";
import {
  errorResponse,
  successPaginatedResponse,
  successResponse,
} from "../utils/response.js";
import { ForbiddenError } from "../utils/errors.js";
import { AuthenticatedRequest } from "../interfaces/cart.interface.js";

export const createInvoiceController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = createInvoiceSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const invoice = await createInvoice(req.user!.id, value);

    successResponse(res, "Invoice created successfully", invoice, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create invoice";

    errorResponse(res, message, undefined, 400);
  }
};

export const getInvoiceByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = invoiceIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const invoice = await getInvoiceById(value.id);

    if (!invoice) {
      errorResponse(res, "Invoice not found", undefined, 404);
      return;
    }

    successResponse(res, "Invoice fetched successfully", invoice);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch invoice";

    errorResponse(res, message, undefined, 400);
  }
};

export const updateInvoicePaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error: paramError, value: params } = invoiceIdSchema.validate(
      req.params
    );

    if (paramError) {
      errorResponse(res, paramError.details[0].message, undefined, 400);
      return;
    }

    const { error, value } = updateInvoicePaymentSchema.validate(req.body);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const invoice = await updateInvoicePayment(params.id, value);

    if (!invoice) {
      errorResponse(res, "Invoice not found", undefined, 404);
      return;
    }

    successResponse(res, "Invoice payment updated", invoice);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update invoice payment";

    errorResponse(res, message, undefined, 400);
  }
};

export const cancelInvoiceController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = invoiceIdSchema.validate(req.params);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const invoice = await cancelInvoice(value.id, {
      id: req.user!.id,
      role: req.user!.role,
    });

    if (!invoice) {
      errorResponse(res, "Invoice not found", undefined, 404);
      return;
    }

    successResponse(res, "Invoice cancelled successfully", invoice);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      errorResponse(res, error.message, undefined, 403);
      return;
    }

    const message =
      error instanceof Error ? error.message : "Unable to cancel invoice";

    errorResponse(res, message, undefined, 400);
  }
};

export const getAllInvoicesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = listInvoicesSchema.validate(req.query);

    if (error) {
      errorResponse(res, error.details[0].message, undefined, 400);
      return;
    }

    const result = await getAllInvoices(value);

    successPaginatedResponse(res, "Invoices fetched successfully", result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch invoices";

    errorResponse(res, message, undefined, 400);
  }
};
