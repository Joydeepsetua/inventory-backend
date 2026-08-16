"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invoices", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      invoice_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },

      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      discount_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      // Rate applied to the whole invoice; kept alongside the computed amount
      // so an old invoice can still be explained after the rate changes.
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },

      tax_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      payment_status: {
        type: Sequelize.ENUM("PENDING", "PAID", "PARTIAL", "CANCELLED"),
        allowNull: false,
        defaultValue: "PENDING",
      },

      payment_method: {
        type: Sequelize.ENUM("CASH", "CARD", "UPI"),
        allowNull: true,
        defaultValue: null,
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },

      invoice_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    await queryInterface.addIndex("invoices", ["customer_id"], {
      name: "invoices_customer_id_idx",
    });

    await queryInterface.addIndex("invoices", ["created_by"], {
      name: "invoices_created_by_idx",
    });

    await queryInterface.addIndex("invoices", ["payment_status"], {
      name: "invoices_payment_status_idx",
    });

    await queryInterface.addIndex("invoices", ["invoice_date"], {
      name: "invoices_invoice_date_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invoices");
  },
};
