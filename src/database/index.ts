import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      dialect: "mysql",
      logging: false,
  
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

export default sequelize;