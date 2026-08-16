"use strict";
const crypto = require("crypto");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const password = await bcrypt.hash("Admin@123", 12);

    await queryInterface.bulkInsert("users", [
      {
        id: crypto.randomUUID(),
        name: "Admin",
        email: "admin@example.com",
        password,
        role: "OWNER",
        is_active: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: "admin@example.com",
    });
  },
};