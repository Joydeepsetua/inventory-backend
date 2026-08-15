"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_variants", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      sku: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },

      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      stock_quantity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      low_stock_threshold: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 10,
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

    await queryInterface.addIndex("product_variants", ["product_id"], {
      name: "product_variants_product_id_idx",
    });

    await queryInterface.addIndex("product_variants", ["is_active"], {
      name: "product_variants_is_active_idx",
    });

    await queryInterface.addIndex("product_variants", ["stock_quantity"], {
      name: "product_variants_stock_quantity_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_variants");
  },
};
