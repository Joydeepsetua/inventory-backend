import { DataTypes, Model, Optional } from "sequelize";

import sequelize from "../database/index.js";
import type ProductCategory from "./product-category.model.js";
import type ProductVariant from "./product-variant.model.js";

interface ProductAttributes {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  brand: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ProductCreationAttributes
  extends Optional<
    ProductAttributes,
    "id" | "description" | "brand" | "is_active" | "created_at" | "updated_at"
  > {}

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  declare id: string;
  declare category_id: string;
  declare name: string;
  declare description: string | null;
  declare brand: string | null;
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  static associate(models: {
    ProductCategory: typeof ProductCategory;
    ProductVariant: typeof ProductVariant;
  }) {
    Product.belongsTo(models.ProductCategory, {
      foreignKey: "category_id",
      as: "category",
    });

    Product.hasMany(models.ProductVariant, {
      foreignKey: "product_id",
      as: "variants",
    });
  }
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "product_categories",
        key: "id",
      },
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "products",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Product;
