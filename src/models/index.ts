import sequelize from "../database/index.ts";

export default async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL database connected successfully");

    // Initialize associations
    // Object.values(models).forEach((model: any) => {
    //     console.log(model.associate);
  
    //     if (typeof model.associate === 'function') {
    //       model.associate(models);
    //     }
    //   });
  } catch (error) {
    console.error("❌ Unable to connect to MySQL database:", error);

    process.exit(1);
  }
};