import Joi from "joi";

export const createProductCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(2000).allow(null, ""),
  is_active: Joi.boolean(),
});

export const updateProductCategorySchema = createProductCategorySchema
  .fork(["name"], (field) => field.optional())
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });

export const productCategoryIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid category id",
  }),
});

export const listProductCategoriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow(""),
  status: Joi.string().valid("active", "inactive", "all").default("all"),
});
