import { Op, WhereOptions } from "sequelize";

import Customer from "../models/customer.model.js";
import { PaginatedResult } from "../utils/response.js";
import { normalizeOptionalFields } from "../utils/normalize.js";
import {
  CreateCustomerInput,
  ListCustomersQuery,
  UpdateCustomerInput,
} from "../interfaces/customer.interface.js";

const OPTIONAL_FIELDS = [
  "email",
  "address",
  "city",
  "state",
  "pincode",
  "gst_number",
] as const;

const assertUniqueContact = async (
  { phone, email }: { phone?: string | null; email?: string | null },
  excludeId?: string
) => {
  const conflicts: WhereOptions[] = [];

  if (phone) conflicts.push({ phone });
  if (email) conflicts.push({ email: email.toLowerCase() });

  if (!conflicts.length) return;

  const existing = await Customer.findOne({
    where: {
      [Op.or]: conflicts,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });

  if (!existing) return;

  if (phone && existing.phone === phone) {
    throw new Error("A customer with this phone number already exists");
  }

  throw new Error("A customer with this email already exists");
};

export const createCustomer = async (input: CreateCustomerInput) => {
  const payload = normalizeOptionalFields(input, OPTIONAL_FIELDS);

  await assertUniqueContact({ phone: payload.phone, email: payload.email });

  return Customer.create(payload);
};

export const getCustomerById = async (id: string) => {
  return Customer.findByPk(id);
};

export const updateCustomer = async (
  id: string,
  input: UpdateCustomerInput
) => {
  const customer = await Customer.findByPk(id);

  if (!customer) return null;

  const payload = normalizeOptionalFields(input, OPTIONAL_FIELDS);

  await assertUniqueContact({ phone: payload.phone, email: payload.email }, id);

  customer.set(payload);

  return customer.save();
};

// Soft delete: the row stays for invoice history, is_active goes to 0.
export const deleteCustomer = async (id: string) => {
  const customer = await Customer.findByPk(id);

  if (!customer) return null;

  if (!customer.is_active) {
    throw new Error("Customer is already deleted");
  }

  customer.is_active = false;

  return customer.save();
};

export const restoreCustomer = async (id: string) => {
  const customer = await Customer.findByPk(id);

  if (!customer) return null;

  customer.is_active = true;

  return customer.save();
};

export const getAllCustomers = async ({
  page,
  limit,
  search,
  status,
}: ListCustomersQuery): Promise<PaginatedResult<Customer[]>> => {
  const where: WhereOptions = {};

  if (status !== "all") {
    Object.assign(where, { is_active: status === "active" });
  }

  if (search) {
    Object.assign(where, {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ],
    });
  }

  const { rows, count } = await Customer.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    // id breaks created_at ties, otherwise rows can repeat or vanish between
    // pages when several customers are created in the same second.
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
  });

  return {
    data: rows,
    pagination: {
      total: count,
      current_page: page,
      total_pages: Math.ceil(count / limit),
      limit,
    },
  };
};
