import { DataTypes, Model, Optional } from "sequelize";

import sequelize from "../database/index.js";
import type Product from "./product.model.js";

interface ProductVariantAttributes {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  // Computed, never stored — see the VIRTUAL column below.
  is_low_stock?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ProductVariantCreationAttributes
  extends Optional<
    ProductVariantAttributes,
    | "id"
    | "price"
    | "stock_quantity"
    | "low_stock_threshold"
    | "is_active"
    | "is_low_stock"
    | "created_at"
    | "updated_at"
  > {}

class ProductVariant
  extends Model<ProductVariantAttributes, ProductVariantCreationAttributes>
  implements ProductVariantAttributes
{
  declare id: string;
  declare product_id: string;
  declare sku: string;
  declare name: string;
  declare price: number;
  declare stock_quantity: number;
  declare low_stock_threshold: number;
  declare is_active: boolean;
  declare readonly is_low_stock: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  static associate(models: { Product: typeof Product }) {
    ProductVariant.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

ProductVariant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },

    sku: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    price: {
      // MySQL returns DECIMAL as a string, so cast it back to a number
      // to keep billing calculations safe.
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get(): number {
        const value = this.getDataValue("price");
        return value === null || value === undefined ? 0 : Number(value);
      },
    },

    stock_quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },

    low_stock_threshold: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 10,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    // Not a column — computed on read so every response carries the restock
    // signal without the client re-deriving it.
    is_low_stock: {
      type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, [
        "stock_quantity",
        "low_stock_threshold",
      ]),
      get(): boolean {
        return (
          Number(this.getDataValue("stock_quantity")) <=
          Number(this.getDataValue("low_stock_threshold"))
        );
      },
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "product_variants",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

ProductVariant.beforeSave((variant) => {
  if (variant.sku) {
    variant.sku = variant.sku.trim().toUpperCase();
  }
});

export default ProductVariant;
