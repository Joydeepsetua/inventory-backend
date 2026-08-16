import { IncludeOptions, Transaction } from "sequelize";

import sequelize from "../database/index.js";
import Cart from "../models/cart.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/product-variant.model.js";
import {
  AddCartItemInput,
  CartSummary,
  UpdateCartItemInput,
} from "../interfaces/cart.interface.js";

// The open cart is every row for this user that has not been billed yet.
// carts and cart_items are one table, so "the cart" is a set of rows, not a row.
export const openCartWhere = (userId: string) => ({
  user_id: userId,
  invoice_id: null,
  status: "ACTIVE" as const,
});

const variantInclude: IncludeOptions = {
  model: ProductVariant,
  as: "variant",
  attributes: ["id", "sku", "name", "price", "stock_quantity", "is_active"],
  include: [
    {
      model: Product,
      as: "product",
      attributes: ["id", "name", "brand", "is_active"],
    },
  ],
};

const customerInclude: IncludeOptions = {
  model: Customer,
  as: "customer",
  attributes: ["id", "name", "phone", "email"],
};

// line_total reads back as a formatted string, so the sum is built from the
// raw column values and only formatted once at the end.
const summarize = (rows: Cart[]): CartSummary => {
  const subtotal = rows.reduce(
    (total, row) =>
      total +
      Number(row.getDataValue("unit_price") ?? 0) *
        Number(row.getDataValue("quantity") ?? 0),
    0
  );

  return {
    item_count: rows.length,
    total_quantity: rows.reduce((total, row) => total + row.quantity, 0),
    subtotal: subtotal.toFixed(2),
  };
};

const loadOpenCart = async (userId: string) => {
  const items = await Cart.findAll({
    where: openCartWhere(userId),
    include: [variantInclude, customerInclude],
    order: [
      ["created_at", "ASC"],
      ["id", "ASC"],
    ],
  });

  // No cart-level customer: every row already carries its own `customer`,
  // and it stays null until the invoice attaches one.
  return {
    items,
    summary: summarize(items),
  };
};


const loadSellableVariant = async (
  variantId: string,
  transaction: Transaction
) => {
  const variant = await ProductVariant.findByPk(variantId, {
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "is_active"] },
    ],
    transaction,
  });

  if (!variant) {
    throw new Error("Variant not found");
  }

  if (!variant.is_active) {
    throw new Error("Variant is inactive");
  }

  const product = (variant as unknown as { product?: Product }).product;

  if (!product || !product.is_active) {
    throw new Error("Product is inactive");
  }

  return { variant, product };
};

export const getCart = async (userId: string) => {
  return loadOpenCart(userId);
};

export const addItemToCart = async (
  userId: string,
  { variant_id, quantity }: AddCartItemInput
) => {
  await sequelize.transaction(async (transaction) => {
    const { variant, product } = await loadSellableVariant(
      variant_id,
      transaction
    );

    const existing = await Cart.findOne({
      where: { ...openCartWhere(userId), variant_id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const desiredQuantity = (existing?.quantity ?? 0) + quantity;

    if (desiredQuantity > variant.stock_quantity) {
      throw new Error(
        `Only ${variant.stock_quantity} unit(s) of ${variant.sku} in stock`
      );
    }

    if (existing) {
      existing.quantity = desiredQuantity;
      await existing.save({ transaction });
      return;
    }

    await Cart.create(
      {
        user_id: userId,
        variant_id,
        sku: variant.sku,
        product_name: `${product.name} - ${variant.name}`,
        // Raw column value, not the formatted read — this is a write.
        unit_price: Number(variant.getDataValue("price") ?? 0),
        quantity,
      },
      { transaction }
    );
  });

  return loadOpenCart(userId);
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  { quantity }: UpdateCartItemInput
) => {
  const updated = await sequelize.transaction(async (transaction) => {
    const item = await Cart.findOne({
      where: { ...openCartWhere(userId), id: itemId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!item) return false;

    const { variant } = await loadSellableVariant(item.variant_id, transaction);

    if (quantity > variant.stock_quantity) {
      throw new Error(
        `Only ${variant.stock_quantity} unit(s) of ${variant.sku} in stock`
      );
    }

    item.quantity = quantity;

    await item.save({ transaction });

    return true;
  });

  if (!updated) return null;

  return loadOpenCart(userId);
};

export const removeCartItem = async (userId: string, itemId: string) => {
  const removed = await Cart.destroy({
    where: { ...openCartWhere(userId), id: itemId },
  });

  if (!removed) return null;

  return loadOpenCart(userId);
};

export const clearCart = async (userId: string) => {
  await Cart.destroy({ where: openCartWhere(userId) });

  return loadOpenCart(userId);
};
