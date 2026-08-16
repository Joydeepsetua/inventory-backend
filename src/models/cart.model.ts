import { DataTypes, Model, Optional } from "sequelize";

import sequelize from "../database/index.js";
import type User from "./user.model.js";
import type Customer from "./customer.model.js";
import type Invoice from "./invoice.model.js";
import type ProductVariant from "./product-variant.model.js";

interface CartAttributes {
  id: string;
  user_id: string;
  customer_id: string | null;
  invoice_id: string | null;
  variant_id: string;
  sku: string;
  product_name: string;
  // Read shape. DECIMAL is exposed as a fixed 2-decimal string so "499.00"
  // survives JSON, which cannot represent a trailing zero on a number.
  unit_price: string;
  quantity: number;
  status: "ACTIVE" | "CONVERTED" | "ABANDONED";
  // Computed, never stored — see the VIRTUAL column below.
  line_total?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Write shape. Callers still pass unit_price as a plain number; only reads are
// formatted.
interface CartCreationAttributes
  extends Omit<
    Optional<
      CartAttributes,
      | "id"
      | "customer_id"
      | "invoice_id"
      | "quantity"
      | "status"
      | "line_total"
      | "created_at"
      | "updated_at"
    >,
    "unit_price"
  > {
  unit_price: number | string;
}

class Cart
  extends Model<CartAttributes, CartCreationAttributes>
  implements CartAttributes
{
  declare id: string;
  declare user_id: string;
  declare customer_id: string | null;
  declare invoice_id: string | null;
  declare variant_id: string;
  declare sku: string;
  declare product_name: string;
  declare unit_price: string;
  declare quantity: number;
  declare status: "ACTIVE" | "CONVERTED" | "ABANDONED";
  declare readonly line_total: string;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Once billed, the row is an invoice line item and is frozen.
  get is_locked(): boolean {
    return this.invoice_id !== null || this.status === "CONVERTED";
  }

  static associate(models: {
    User: typeof User;
    Customer: typeof Customer;
    Invoice: typeof Invoice;
    ProductVariant: typeof ProductVariant;
  }) {
    Cart.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });

    Cart.belongsTo(models.Customer, {
      foreignKey: "customer_id",
      as: "customer",
    });

    Cart.belongsTo(models.Invoice, {
      foreignKey: "invoice_id",
      as: "invoice",
    });

    Cart.belongsTo(models.ProductVariant, {
      foreignKey: "variant_id",
      as: "variant",
    });
  }
}

// Money columns always read back as "xxx.00". Arithmetic must go through
// getDataValue(field) so it never operates on the formatted string.
const decimalAmount = (field: keyof CartAttributes) => ({
  get(this: Cart): string {
    const value = this.getDataValue(field);
    return Number(value ?? 0).toFixed(2);
  },
});

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "customers",
        key: "id",
      },
    },

    invoice_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "invoices",
        key: "id",
      },
    },

    variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "product_variants",
        key: "id",
      },
    },

    // Snapshots taken when the row is added, so later catalogue edits never
    // rewrite a billed invoice.
    sku: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },

    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      ...decimalAmount("unit_price"),
    },

    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "CONVERTED", "ABANDONED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    // Not a column — discount and tax are applied at invoice level, so a line
    // is simply price x quantity. Computed on read so it can never drift.
    line_total: {
      type: DataTypes.VIRTUAL(DataTypes.DECIMAL(12, 2), [
        "unit_price",
        "quantity",
      ]),
      get(): string {
        const price = Number(this.getDataValue("unit_price") ?? 0);
        const quantity = Number(this.getDataValue("quantity") ?? 0);

        return (price * quantity).toFixed(2);
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
    tableName: "carts",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Cart;
