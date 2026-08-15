import { Op, WhereOptions, literal } from "sequelize";

import ProductCategory from "../models/product-category.model.js";
import Product from "../models/product.model.js";
import { PaginatedResult } from "../utils/response.js";
import { normalizeOptionalFields } from "../utils/normalize.js";
import {
  CreateProductCategoryInput,
  ListProductCategoriesQuery,
  UpdateProductCategoryInput,
} from "../interfaces/product-category.interface.js";

const OPTIONAL_FIELDS = ["description"] as const;

const productCountColumn = literal(
  "(SELECT COUNT(*) FROM `products` WHERE `products`.`category_id` = `ProductCategory`.`id` AND `products`.`is_active` = true)"
);

const withProductCount = {
  include: [[productCountColumn, "product_count"] as [typeof productCountColumn, string]],
};

const assertUniqueName = async (name?: string, excludeId?: string) => {
  if (!name) return;

  const existing = await ProductCategory.findOne({
    where: {
      name,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new Error("A category with this name already exists");
  }
};

export const createProductCategory = async (
  input: CreateProductCategoryInput
) => {
  const payload = normalizeOptionalFields(input, OPTIONAL_FIELDS);

  await assertUniqueName(payload.name);

  return ProductCategory.create(payload);
};

export const getProductCategoryById = async (id: string) => {
  return ProductCategory.findByPk(id, { attributes: withProductCount });
};

export const updateProductCategory = async (
  id: string,
  input: UpdateProductCategoryInput
) => {
  const category = await ProductCategory.findByPk(id);

  if (!category) return null;

  const payload = normalizeOptionalFields(input, OPTIONAL_FIELDS);

  await assertUniqueName(payload.name, id);

  category.set(payload);

  await category.save();

  return getProductCategoryById(id);
};

export const deleteProductCategory = async (id: string) => {
  const category = await ProductCategory.findByPk(id);

  if (!category) return null;

  if (!category.is_active) {
    throw new Error("Category is already deleted");
  }

  const activeProducts = await Product.count({
    where: { category_id: id, is_active: true },
  });

  if (activeProducts > 0) {
    throw new Error(
      `Category has ${activeProducts} active product(s). Delete or move them first`
    );
  }

  category.is_active = false;

  await category.save();

  return getProductCategoryById(id);
};

export const restoreProductCategory = async (id: string) => {
  const category = await ProductCategory.findByPk(id);

  if (!category) return null;

  category.is_active = true;

  await category.save();

  return getProductCategoryById(id);
};

export const getAllProductCategories = async ({
  page,
  limit,
  search,
  status,
}: ListProductCategoriesQuery): Promise<PaginatedResult<ProductCategory[]>> => {
  const where: WhereOptions = {};

  if (status !== "all") {
    Object.assign(where, { is_active: status === "active" });
  }

  if (search) {
    Object.assign(where, { name: { [Op.like]: `%${search}%` } });
  }

  const { rows, count } = await ProductCategory.findAndCountAll({
    where,
    attributes: withProductCount,
    limit,
    offset: (page - 1) * limit,
    // id breaks created_at ties, otherwise rows can repeat or vanish between
    // pages when several categories are created in the same second.
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
