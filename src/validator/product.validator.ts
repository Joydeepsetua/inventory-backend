import Joi from "joi";

export const createProductSchema = Joi.object({
  category_id: Joi.string().uuid().required().messages({
    "string.guid": "category_id must be a valid category id",
  }),
  name: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().max(2000).allow(null, ""),
  brand: Joi.string().trim().max(100).allow(null, ""),
  is_active: Joi.boolean(),
});

export const updateProductSchema = createProductSchema
  .fork(["category_id", "name"], (field) => field.optional())
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });

export const productIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid product id",
  }),
});

export const listProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(150).allow(""),
  status: Joi.string().valid("active", "inactive", "all").default("all"),
  category_id: Joi.string().uuid().messages({
    "string.guid": "category_id must be a valid category id",
  }),
});
