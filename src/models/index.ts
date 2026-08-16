import sequelize from "../database/index.js";
import User from "./user.model.js";
import ProductCategory from "./product-category.model.js";
import Product from "./product.model.js";
import ProductVariant from "./product-variant.model.js";
import Customer from "./customer.model.js";
import Invoice from "./invoice.model.js";
import Cart from "./cart.model.js";

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

    throw error;
  }
}
