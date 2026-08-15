import { DataTypes, Model, Optional } from "sequelize";

import sequelize from "../database/index.js";
import type Invoice from "./invoice.model.js";

interface CustomerAttributes {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gst_number: string | null;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CustomerCreationAttributes
  extends Optional<
    CustomerAttributes,
    | "id"
    | "email"
    | "address"
    | "city"
    | "state"
    | "pincode"
    | "gst_number"
    | "is_active"
    | "created_at"
    | "updated_at"
  > {}

class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  declare id: string;
  declare name: string;
  declare email: string | null;
  declare phone: string;
  declare address: string | null;
  declare city: string | null;
  declare state: string | null;
  declare pincode: string | null;
  declare gst_number: string | null;
  declare is_active: boolean;
  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  static associate(models: { Invoice: typeof Invoice }) {
    Customer.hasMany(models.Invoice, {
      foreignKey: "customer_id",
      as: "invoices",
    });
  }
}

Customer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: null,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },

    pincode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
    },

    gst_number: {
      type: DataTypes.STRING(20),
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
    tableName: "customers",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Customer.beforeSave((customer) => {
  if (customer.email) {
    customer.email = customer.email.trim().toLowerCase();
  }

  if (customer.gst_number) {
    customer.gst_number = customer.gst_number.trim().toUpperCase();
  }
});

export default Customer;
