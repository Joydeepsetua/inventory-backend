"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("carts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      // Null while the row is in an open cart; set on every row of the cart at
      // checkout. Rows carrying an invoice_id are that invoice's line items and
      // must never be edited again.
      invoice_id: {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
        references: {
          model: "invoices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      variant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "product_variants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      // sku / product_name / unit_price are snapshots taken when the row is
      // added, so later catalogue edits never rewrite a billed invoice.
      sku: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },

      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      quantity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },

      status: {
        type: Sequelize.ENUM("ACTIVE", "CONVERTED", "ABANDONED"),
        allowNull: false,
        defaultValue: "ACTIVE",
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

    // Open-cart lookup: user_id + invoice_id IS NULL.
    await queryInterface.addIndex("carts", ["user_id", "invoice_id"], {
      name: "carts_user_id_invoice_id_idx",
    });

    // Invoice line-item lookup.
    await queryInterface.addIndex("carts", ["invoice_id"], {
      name: "carts_invoice_id_idx",
    });

    // Not unique on purpose: the same variant may appear in many carts over
    // time. "One row per variant in an open cart" is enforced in the service.
    await queryInterface.addIndex("carts", ["user_id", "variant_id"], {
      name: "carts_user_id_variant_id_idx",
    });

    await queryInterface.addIndex("carts", ["customer_id"], {
      name: "carts_customer_id_idx",
    });

    await queryInterface.addIndex("carts", ["variant_id"], {
      name: "carts_variant_id_idx",
    });

    await queryInterface.addIndex("carts", ["status"], {
      name: "carts_status_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("carts");
  },
};
