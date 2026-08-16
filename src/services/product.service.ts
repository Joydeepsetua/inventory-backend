import { Op, WhereOptions } from "sequelize";

import Product from "../models/product.model.js";
import ProductCategory from "../models/product-category.model.js";
import ProductVariant from "../models/product-variant.model.js";
import { PaginatedResult } from "../utils/response.js";
import { normalizeOptionalFields } from "../utils/normalize.js";
import {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../interfaces/product.interface.js";

const OPTIONAL_FIELDS = ["description", "brand"] as const;

const categoryAttributes = ["id", "name", "is_active"];

const assertCategoryExists = async (categoryId?: string) => {
  if (!categoryId) return;

  const category = await ProductCategory.findByPk(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  if (!category.is_active) {
    throw new Error("Category is inactive");
  }
};

export const createProduct = async (input: CreateProductInput) => {
  await assertCategoryExists(input.category_id);

  const payload = normalizeOptionalFields(input, OPTIONAL_FIELDS);

  const product = await Product.create(payload);

  return Product.findByPk(product.id, {
    include: [
      { model: ProductCategory, as: "category", attributes: categoryAttributes },
    ],
  });
};

export const getProductById = async (id: string) => {
  return Product.findByPk(id, {
    include: [
      { model: ProductCategory, as: "category", attributes: categoryAttributes },
      { model: ProductVariant, as: "variants" },
    ],
    order: [[{ model: ProductVariant, as: "variants" }, "created_at", "ASC"]],
  });
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const product = await Product.findByPk(id);

  if (!product) return null;

  await assertCategoryExists(input.category_id);

  const payload = normalizeOptionalFields(input, OPTIONAL_FIELDS);

  product.set(payload);

  await product.save();

  return getProductById(id);
};

// Soft delete: the row stays so historical invoices still resolve, is_active
// goes to 0. Variants are left untouched — reactivating a product should not
// silently reactivate variants that were disabled on their own.
export const deleteProduct = async (id: string) => {
  const product = await Product.findByPk(id);

  if (!product) return null;

  if (!product.is_active) {
    throw new Error("Product is already deleted");
  }

  product.is_active = false;

  return product.save();
};

export const restoreProduct = async (id: string) => {
  const product = await Product.findByPk(id);

  if (!product) return null;

  product.is_active = true;

  return product.save();
};

export const getAllProducts = async ({
  page,
  limit,
  search,
  status,
  category_id,
}: ListProductsQuery): Promise<PaginatedResult<Product[]>> => {
  const where: WhereOptions = {};

  if (status !== "all") {
    Object.assign(where, { is_active: status === "active" });
  }

  if (category_id) {
    Object.assign(where, { category_id });
  }

  if (search) {
    Object.assign(where, {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
      ],
    });
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    include: [
      { model: ProductCategory, as: "category", attributes: categoryAttributes },
    ],
    // id breaks created_at ties, otherwise rows can repeat or vanish between
    // pages when several products are created in the same second.
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      current_page: page,
      total_pages: Math.ceil(count / limit),
      limit,
    },
  };
};
