"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("customers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        defaultValue: null,
        unique: true,
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },

      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      },

      pincode: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null,
      },

      gst_number: {
        type: Sequelize.STRING(20),
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

    await queryInterface.addIndex("customers", ["name"], {
      name: "customers_name_idx",
    });

    await queryInterface.addIndex("customers", ["is_active"], {
      name: "customers_is_active_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("customers");
  },
};
