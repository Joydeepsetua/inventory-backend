import Joi from "joi";

const paymentMethod = Joi.string()
  .valid("CASH", "CARD", "UPI")
  .allow(null)
  .messages({
    "any.only": "payment_method must be one of CASH, CARD or UPI",
  });

// CANCELLED is deliberately not settable here — cancelling has to restore
// stock, so it goes through its own endpoint.
const settablePaymentStatus = Joi.string()
  .valid("PENDING", "PAID", "PARTIAL")
  .messages({
    "any.only": "payment_status must be one of PENDING, PAID or PARTIAL",
  });

export const createInvoiceSchema = Joi.object({
  customer_id: Joi.string().uuid().required().messages({
    "string.guid": "customer_id must be a valid customer id",
  }),
  discount_amount: Joi.number().min(0).max(99999999.99).precision(2).default(0),
  tax_rate: Joi.number().min(0).max(100).precision(2).default(0),
  payment_status: settablePaymentStatus.default("PENDING"),
  payment_method: paymentMethod,
  notes: Joi.string().trim().max(2000).allow("", null),
});

export const updateInvoicePaymentSchema = Joi.object({
  payment_status: settablePaymentStatus.required(),
  payment_method: paymentMethod,
});

export const invoiceIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid invoice id",
  }),
});

export const listInvoicesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(30).allow(""),
  payment_status: Joi.string()
    .valid("PENDING", "PAID", "PARTIAL", "CANCELLED")
    .messages({
      "any.only":
        "payment_status must be one of PENDING, PAID, PARTIAL or CANCELLED",
    }),
  customer_id: Joi.string().uuid().messages({
    "string.guid": "customer_id must be a valid customer id",
  }),
  created_by: Joi.string().uuid().messages({
    "string.guid": "created_by must be a valid user id",
  }),
  date_from: Joi.date().iso(),
  // The min() bound is applied only when date_from is present — an unresolved
  // ref makes Joi reject date_to outright, which would block an open-ended
  // "everything up to this date" query.
  date_to: Joi.date()
    .iso()
    .when("date_from", {
      is: Joi.exist(),
      then: Joi.date().iso().min(Joi.ref("date_from")),
    })
    .messages({
      "date.min": "date_to cannot be earlier than date_from",
    }),
});
