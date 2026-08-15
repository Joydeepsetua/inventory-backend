"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "product_categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },

      brand: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("products", ["category_id"], {
      name: "products_category_id_idx",
    });

    await queryInterface.addIndex("products", ["name"], {
      name: "products_name_idx",
    });

    await queryInterface.addIndex("products", ["is_active"], {
      name: "products_is_active_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("products");
  },
};
