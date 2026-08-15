import bcrypt from "bcrypt";
import {
  DataTypes,
  Model,
  Optional,
} from "sequelize";

import sequelize from "../database/index.js";

const SALT_ROUNDS = 12;
  
  interface UserAttributes {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "OWNER" | "SALESMAN";
    is_active: boolean;
    last_login_at: Date | null;
    created_at?: Date;
    updated_at?: Date;
  }
  
  interface UserCreationAttributes
    extends Optional<
      UserAttributes,
      "id" | "role" | "is_active" | "last_login_at" | "created_at" | "updated_at"
    > {}
  
  class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
  {
    declare id: string;
    declare name: string;
    declare email: string;
    declare password: string;
    declare role: "OWNER" | "SALESMAN";
    declare is_active: boolean;
    declare last_login_at: Date | null;
    declare readonly created_at: Date;
    declare readonly updated_at: Date;
  }
  
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
  
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
  
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
  
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
  
      role: {
        type: DataTypes.ENUM("OWNER", "SALESMAN"),
        allowNull: false,
        defaultValue: "OWNER",
      },
  
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
  
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      tableName: "users",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password") && user.password) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
});

export default User;