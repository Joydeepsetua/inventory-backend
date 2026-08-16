import { IncludeOptions, Op, WhereOptions, col, where as sqlWhere } from "sequelize";

import ProductVariant from "../models/product-variant.model.js";
import Product from "../models/product.model.js";
import ProductCategory from "../models/product-category.model.js";
import { PaginatedResult } from "../utils/response.js";
import {
  CreateProductVariantInput,
  ListProductVariantsQuery,
  UpdateProductVariantInput,
} from "../interfaces/product-variant.interface.js";

const productInclude: IncludeOptions = {
  model: Product,
  as: "product",
  attributes: ["id", "name", "brand", "category_id", "is_active"],
  include: [
    {
      model: ProductCategory,
      as: "category",
      attributes: ["id", "name", "is_active"],
    },
  ],
};

const assertProductExists = async (productId?: string) => {
  if (!productId) return;

  const product = await Product.findByPk(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.is_active) {
    throw new Error("Product is inactive");
  }
};

// sku carries a UNIQUE index and the model upper-cases it before saving, so the
// check has to compare against the same normalized form.
const assertUniqueSku = async (sku?: string, excludeId?: string) => {
  if (!sku) return;

  const existing = await ProductVariant.findOne({
    where: {
      sku: sku.trim().toUpperCase(),
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new Error("A variant with this SKU already exists");
  }
};

export const createProductVariant = async (
  input: CreateProductVariantInput
) => {
  await assertProductExists(input.product_id);
  await assertUniqueSku(input.sku);

  const variant = await ProductVariant.create(input);

  return getProductVariantById(variant.id);
};

export const getProductVariantById = async (id: string) => {
  return ProductVariant.findByPk(id, { include: [productInclude] });
};

export const updateProductVariant = async (
  id: string,
  input: UpdateProductVariantInput
) => {
  const variant = await ProductVariant.findByPk(id);

  if (!variant) return null;

  await assertProductExists(input.product_id);
  await assertUniqueSku(input.sku, id);

  // price is read back as a formatted string, so a numeric update has to be
  // converted before it is set.
  const { price, ...rest } = input;

  variant.set(rest);

  if (price !== undefined) {
    variant.set("price", price.toFixed(2));
  }

  await variant.save();

  return getProductVariantById(id);
};

// Soft delete: the row stays so billed cart rows still resolve their variant,
// is_active goes to 0.
export const deleteProductVariant = async (id: string) => {
  const variant = await ProductVariant.findByPk(id);

  if (!variant) return null;

  if (!variant.is_active) {
    throw new Error("Variant is already deleted");
  }

  variant.is_active = false;

  await variant.save();

  return getProductVariantById(id);
};

export const restoreProductVariant = async (id: string) => {
  const variant = await ProductVariant.findByPk(id);

  if (!variant) return null;

  variant.is_active = true;

  await variant.save();

  return getProductVariantById(id);
};

export const getAllProductVariants = async ({
  page,
  limit,
  search,
  status,
  product_id,
  category_id,
  low_stock,
}: ListProductVariantsQuery): Promise<PaginatedResult<ProductVariant[]>> => {
  const where: WhereOptions[] = [];

  if (status !== "all") {
    where.push({ is_active: status === "active" });
  }

  if (product_id) {
    where.push({ product_id });
  }

  if (low_stock !== undefined) {
    // Column-to-column comparison, so it needs sequelize's where() helper.
    // The negative case is spelled out as ">" rather than wrapping the
    // positive one in Op.not, which does not negate this form correctly.
    where.push(
      low_stock
        ? sqlWhere(col("stock_quantity"), Op.lte, col("low_stock_threshold"))
        : sqlWhere(col("stock_quantity"), Op.gt, col("low_stock_threshold"))
    );
  }

  if (search) {
    where.push({
      [Op.or]: [
        { sku: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
      ],
    });
  }

  // Filtering by category needs the join to be an INNER JOIN, otherwise the
  // condition would not restrict the variant rows.
  const include: IncludeOptions = category_id
    ? { ...productInclude, required: true, where: { category_id } }
    : productInclude;

  const { rows, count } = await ProductVariant.findAndCountAll({
    where: where.length ? { [Op.and]: where } : {},
    include: [include],
    limit,
    offset: (page - 1) * limit,
    // The include is a belongsTo, so no row multiplication — distinct is not
    // needed, but id still breaks created_at ties across pages.
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
