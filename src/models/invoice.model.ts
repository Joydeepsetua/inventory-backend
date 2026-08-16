import { DataTypes, Model, Optional } from "sequelize";

import sequelize from "../database/index.js";
import type User from "./user.model.js";
import type Customer from "./customer.model.js";
import type Cart from "./cart.model.js";

interface InvoiceAttributes {
  id: string;
  invoice_number: string;
  customer_id: string;
  created_by: string;
  // Read shape. DECIMAL is exposed as a fixed 2-decimal string so "499.00"
  // survives JSON, which cannot represent a trailing zero on a number.
  subtotal: string;
  discount_amount: string;
  tax_rate: string;
  tax_amount: string;
  total_amount: string;
  payment_status: "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
  payment_method: "CASH" | "CARD" | "UPI" | null;
  notes: string | null;
  invoice_date: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Write shape. Callers still pass amounts as plain numbers; only reads are
// formatted.
interface InvoiceCreationAttributes
  extends Omit<
    Optional<
      InvoiceAttributes,
      | "id"
      | "subtotal"
      | "discount_amount"
      | "tax_rate"
      | "tax_amount"
      | "total_amount"
      | "payment_status"
      | "payment_method"
      | "notes"
      | "invoice_date"
      | "created_at"
      | "updated_at"
    >,
    "subtotal" | "discount_amount" | "tax_rate" | "tax_amount" | "total_amount"
  > {
  subtotal?: number | string;
  discount_amount?: number | string;
  tax_rate?: number | string;
  tax_amount?: number | string;
  total_amount?: number | string;
}

class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  declare id: string;
  declare invoice_number: string;
  declare customer_id: string;
  declare created_by: string;
  declare subtotal: string;
  declare discount_amount: string;
  declare tax_rate: string;
  declare tax_amount: string;
  declare total_amount: string;
  declare payment_status: "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
  declare payment_method: "CASH" | "CARD" | "UPI" | null;
  declare notes: string | null;
  declare invoice_date: Date;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  static associate(models: {
    User: typeof User;
    Customer: typeof Customer;
    Cart: typeof Cart;
  }) {
    Invoice.belongsTo(models.Customer, {
      foreignKey: "customer_id",
      as: "customer",
    });

    Invoice.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
    });

    // Cart rows carrying this invoice_id are the invoice's line items.
    Invoice.hasMany(models.Cart, {
      foreignKey: "invoice_id",
      as: "items",
    });
  }
}

// Money columns always read back as "xxx.00". Billing arithmetic must go
// through getDataValue(field) so it never operates on the formatted string.
const decimalAmount = (field: keyof InvoiceAttributes) => ({
  get(this: Invoice): string {
    const value = this.getDataValue(field);
    return Number(value ?? 0).toFixed(2);
  },
});

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    invoice_number: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },

    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "customers",
        key: "id",
      },
    },

    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      ...decimalAmount("subtotal"),
    },

    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      ...decimalAmount("discount_amount"),
    },

    // Rate applied to the whole invoice; kept alongside the computed amount so
    // an old invoice can still be explained after the rate changes.
    tax_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      ...decimalAmount("tax_rate"),
    },

    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      ...decimalAmount("tax_amount"),
    },

    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      ...decimalAmount("total_amount"),
    },

    payment_status: {
      type: DataTypes.ENUM("PENDING", "PAID", "PARTIAL", "CANCELLED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    payment_method: {
      type: DataTypes.ENUM("CASH", "CARD", "UPI"),
      allowNull: true,
      defaultValue: null,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    invoice_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: "invoices",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Invoice;
