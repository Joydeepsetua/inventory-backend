import Joi from "joi";

export const addCartItemSchema = Joi.object({
  variant_id: Joi.string().uuid().required().messages({
    "string.guid": "variant_id must be a valid variant id",
  }),
  quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

export const cartItemIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "id must be a valid cart item id",
  }),
});
