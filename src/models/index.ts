import sequelize from "../database/index.ts";
import User from "./user.model.ts";
import ProductCategory from "./product-category.model.ts";
import Product from "./product.model.ts";
import ProductVariant from "./product-variant.model.ts";
import Customer from "./customer.model.ts";
import Invoice from "./invoice.model.ts";
import Cart from "./cart.model.ts";

const models = {
  User,
  ProductCategory,
  Product,
  ProductVariant,
  Customer,
  Invoice,
  Cart,
};

type ModelsRegistry = typeof models;

type ModelWithAssociate = {
  associate?: (registry: ModelsRegistry) => void;
};

export {
  User,
  ProductCategory,
  Product,
  ProductVariant,
  Customer,
  Invoice,
  Cart,
  models,
};

export default async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL database connected successfully");

    Object.values(models).forEach((model) => {
      const associate = (model as ModelWithAssociate).associate;
      if (typeof associate === "function") {
        associate(models);
      }
    });
  } catch (error) {
    console.error("❌ Unable to connect to MySQL database:", error);

    process.exit(1);
  }
}
