import Joi from "joi";

// Shared field rules. Defaults are attached only on the create schema —
// on update they would silently reset price/stock when the key is omitted.
const productId = Joi.string().uuid().messages({
  "string.guid": "product_id must be a valid product id",
});

const sku = Joi.string()
  .trim()
  .max(64)
  .pattern(/^[A-Za-z0-9._-]+$/)
  .messages({
    "string.pattern.base":
      "sku may only contain letters, numbers, dot, dash and underscore",
  });

const name = Joi.string().trim().min(1).max(150);

const price = Joi.number().min(0).max(99999999.99).precision(2);

const stockQuantity = Joi.number().integer().min(0);

const lowStockThreshold = Joi.number().integer().min(0);

export const createProductVariantSchema = Joi.object({
  product_id: productId.required(),
  sku: sku.required(),
  name: name.required(),
  price: price.default(0),
  stock_quantity: stockQuantity.default(0),
  low_stock_threshold: lowStockThreshold.default(10),
  is_active: Joi.boolean(),
});

export const updateProductVariantSchema = Joi.object({
  product_id: productId,
  sku,
  name,
  price,
  stock_quantity: stockQuantity,
  low_stock_threshold: lowStockThreshold,
  is_active: Joi.boolean(),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });

export const productVariantIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid variant id",
  }),
});

export const listProductVariantsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(150).allow(""),
  status: Joi.string().valid("active", "inactive", "all").default("all"),
  product_id: productId,
  category_id: Joi.string().uuid().messages({
    "string.guid": "category_id must be a valid category id",
  }),
  low_stock: Joi.boolean(),
});
