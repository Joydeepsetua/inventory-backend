import "dotenv/config";

import mysql2 from "mysql2";
import { Sequelize } from "sequelize";

const isServerless = !!process.env.VERCEL;

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    dialectModule: mysql2,
    logging: false,

    pool: {
      max: isServerless ? 2 : 10,
      min: 0,
      acquire: 30000,
      idle: isServerless ? 1000 : 10000,
    },
  }
);

export default sequelize;
