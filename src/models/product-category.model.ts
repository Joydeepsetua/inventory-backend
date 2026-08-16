import { DataTypes, Model, Optional } from "sequelize";

import sequelize from "../database/index.js";
import type Product from "./product.model.js";

interface ProductCategoryAttributes {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface ProductCategoryCreationAttributes
  extends Optional<
    ProductCategoryAttributes,
    "id" | "description" | "is_active" | "created_at" | "updated_at"
  > {}

class ProductCategory
  extends Model<ProductCategoryAttributes, ProductCategoryCreationAttributes>
  implements ProductCategoryAttributes
{
  declare id: string;
  declare name: string;
  declare description: string | null;
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  static associate(models: { Product: typeof Product }) {
    ProductCategory.hasMany(models.Product, {
      foreignKey: "category_id",
      as: "products",
    });
  }
}

ProductCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
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
    tableName: "product_categories",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ProductCategory;
