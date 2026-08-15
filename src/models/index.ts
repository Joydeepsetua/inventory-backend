import sequelize from "../database/index.ts";
import User from "./user.model.ts";

const models = {
  User,
};

type ModelsRegistry = typeof models;

type ModelWithAssociate = {
  associate?: (registry: ModelsRegistry) => void;
};

export { User, models };

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
