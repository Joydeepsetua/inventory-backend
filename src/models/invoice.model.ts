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
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  payment_status: "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
  payment_method: "CASH" | "CARD" | "UPI" | null;
  notes: string | null;
  invoice_date: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface InvoiceCreationAttributes
  extends Optional<
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
  > {}

class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  declare id: string;
  declare invoice_number: string;
  declare customer_id: string;
  declare created_by: string;
  declare subtotal: number;
  declare discount_amount: number;
  declare tax_rate: number;
  declare tax_amount: number;
  declare total_amount: number;
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

// MySQL returns DECIMAL as a string; cast money columns back to numbers so
// billing totals stay arithmetic-safe.
const decimalAmount = (field: keyof InvoiceAttributes) => ({
  get(this: Invoice): number {
    const value = this.getDataValue(field);
    return value === null || value === undefined ? 0 : Number(value);
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
