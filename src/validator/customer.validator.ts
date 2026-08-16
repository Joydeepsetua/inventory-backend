import Joi from "joi";

export const createCustomerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  email: Joi.string().trim().email().max(150).allow(null, ""),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s]{7,20}$/)
    .required()
    .messages({
      "string.pattern.base": "phone must be a valid phone number",
    }),
  address: Joi.string().trim().max(500).allow(null, ""),
  city: Joi.string().trim().max(100).allow(null, ""),
  state: Joi.string().trim().max(100).allow(null, ""),
  pincode: Joi.string().trim().max(10).allow(null, ""),
  gst_number: Joi.string().trim().max(20).allow(null, ""),
  is_active: Joi.boolean(),
});

export const updateCustomerSchema = createCustomerSchema
  .fork(["name", "phone"], (field) => field.optional())
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });

export const customerIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid customer id",
  }),
});

export const listCustomersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(150).allow(""),
  status: Joi.string().valid("active", "inactive", "all").default("all"),
});
