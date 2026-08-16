import { IncludeOptions, Op, Transaction, WhereOptions } from "sequelize";

import sequelize from "../database/index.js";
import Cart from "../models/cart.model.js";
import Customer from "../models/customer.model.js";
import Invoice from "../models/invoice.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/product-variant.model.js";
import User from "../models/user.model.js";
import { PaginatedResult } from "../utils/response.js";
import { ForbiddenError } from "../utils/errors.js";
import { openCartWhere } from "./cart.service.js";
import {
  CreateInvoiceInput,
  InvoiceActor,
  ListInvoicesQuery,
  UpdateInvoicePaymentInput,
} from "../interfaces/invoice.interface.js";


const round2 = (value: number) => Number(value.toFixed(2));

// A date-only date_to parses to midnight, and an inclusive "<=" against that
// would drop the whole day it names. Midnight is stretched to the end of that
// day; an explicit time of day is left exactly as the caller sent it.
const inclusiveEnd = (value: Date) => {
  const isMidnight =
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0;

  if (!isMidnight) return value;

  const end = new Date(value);

  end.setUTCHours(23, 59, 59, 999);

  return end;
};

const itemsInclude: IncludeOptions = {
  model: Cart,
  as: "items",
  attributes: [
    "id",
    "variant_id",
    "sku",
    "product_name",
    "unit_price",
    "quantity",
    "line_total",
  ],
  include: [
    {
      model: ProductVariant,
      as: "variant",
      attributes: ["id", "sku", "name", "price", "is_active"],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "brand", "is_active"],
        },
      ],
    },
  ],
};

const customerInclude: IncludeOptions = {
  model: Customer,
  as: "customer",
  attributes: ["id", "name", "phone", "email", "address", "gst_number"],
};

const creatorInclude: IncludeOptions = {
  model: User,
  as: "creator",
  attributes: ["id", "name", "email", "role"],
};

export const getInvoiceById = async (id: string) => {
  return Invoice.findByPk(id, {
    include: [customerInclude, creatorInclude, itemsInclude],
    order: [[{ model: Cart, as: "items" }, "created_at", "ASC"]],
  });
};


// INV-20260816143052123-4F2A
const nextInvoiceNumber = () => {
  const now = new Date();

  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
    String(now.getMilliseconds()).padStart(3, "0"),
  ].join("");

  const suffix = Math.random()
    .toString(36)
    .slice(2, 6)
    .padEnd(4, "0")
    .toUpperCase();

  return `INV-${stamp}-${suffix}`;
};

const buildInvoice = async (
  userId: string,
  input: CreateInvoiceInput,
  transaction: Transaction
) => {
  const customer = await Customer.findByPk(input.customer_id, { transaction });

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (!customer.is_active) {
    throw new Error("Customer is inactive");
  }

  const items = await Cart.findAll({
    where: openCartWhere(userId),
    order: [["id", "ASC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!items.length) {
    throw new Error("Cart is empty. Add an item before creating an invoice");
  }


  const quantityByVariant = new Map<string, number>();

  items.forEach((item) => {
    quantityByVariant.set(
      item.variant_id,
      (quantityByVariant.get(item.variant_id) ?? 0) + item.quantity
    );
  });

  const variants = await ProductVariant.findAll({
    where: { id: { [Op.in]: [...quantityByVariant.keys()] } },
    order: [["id", "ASC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  quantityByVariant.forEach((quantity, variantId) => {
    const variant = variantById.get(variantId);

    if (!variant) {
      throw new Error("A variant in the cart no longer exists");
    }

    if (quantity > variant.stock_quantity) {
      throw new Error(
        `Only ${variant.stock_quantity} unit(s) of ${variant.sku} in stock`
      );
    }
  });

  for (const [variantId, quantity] of quantityByVariant) {
    const variant = variantById.get(variantId)!;

    variant.stock_quantity -= quantity;

    await variant.save({ transaction });
  }

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.getDataValue("unit_price") ?? 0) *
        Number(item.getDataValue("quantity") ?? 0),
    0
  );

  if (input.discount_amount > subtotal) {
    throw new Error("discount_amount cannot be greater than the cart subtotal");
  }

  const taxable = subtotal - input.discount_amount;
  const taxAmount = round2(taxable * (input.tax_rate / 100));

  const invoice = await Invoice.create(
    {
      invoice_number: nextInvoiceNumber(),
      customer_id: customer.id,
      created_by: userId,
      subtotal: round2(subtotal),
      discount_amount: round2(input.discount_amount),
      tax_rate: input.tax_rate,
      tax_amount: taxAmount,
      total_amount: round2(taxable + taxAmount),
      payment_status: input.payment_status,
      payment_method: input.payment_method ?? null,
      notes: input.notes ?? null,
    },
    { transaction }
  );

 
  await Cart.update(
    {
      invoice_id: invoice.id,
      customer_id: customer.id,
      status: "CONVERTED",
    },
    { where: openCartWhere(userId), transaction }
  );

  return invoice.id;
};

export const createInvoice = async (
  userId: string,
  input: CreateInvoiceInput
) => {
  
  const id = await sequelize.transaction((transaction) =>
    buildInvoice(userId, input, transaction)
  );

  return getInvoiceById(id);
};

export const updateInvoicePayment = async (
  id: string,
  { payment_status, payment_method }: UpdateInvoicePaymentInput
) => {
  const invoice = await Invoice.findByPk(id);

  if (!invoice) return null;

  if (invoice.payment_status === "CANCELLED") {
    throw new Error("A cancelled invoice cannot be updated");
  }

  invoice.payment_status = payment_status;

  if (payment_method !== undefined) {
    invoice.payment_method = payment_method;
  }

  await invoice.save();

  return getInvoiceById(id);
};

// Cancelling voids a sale and pushes stock back, so a salesman may only undo
// their own bill. An owner may cancel any.
export const cancelInvoice = async (id: string, actor: InvoiceActor) => {
  const cancelled = await sequelize.transaction(async (transaction) => {
    const invoice = await Invoice.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!invoice) return false;

    if (actor.role !== "OWNER" && invoice.created_by !== actor.id) {
      throw new ForbiddenError("You can only cancel invoices you created");
    }

    if (invoice.payment_status === "CANCELLED") {
      throw new Error("Invoice is already cancelled");
    }

    const items = await Cart.findAll({
      where: { invoice_id: id },
      transaction,
    });

    const quantityByVariant = new Map<string, number>();

    items.forEach((item) => {
      quantityByVariant.set(
        item.variant_id,
        (quantityByVariant.get(item.variant_id) ?? 0) + item.quantity
      );
    });

    const variants = await ProductVariant.findAll({
      where: { id: { [Op.in]: [...quantityByVariant.keys()] } },
      order: [["id", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    for (const variant of variants) {
      variant.stock_quantity += quantityByVariant.get(variant.id) ?? 0;

      await variant.save({ transaction });
    }

    invoice.payment_status = "CANCELLED";

    await invoice.save({ transaction });

    return true;
  });

  if (!cancelled) return null;

  return getInvoiceById(id);
};

export const getAllInvoices = async ({
  page,
  limit,
  search,
  payment_status,
  customer_id,
  created_by,
  date_from,
  date_to,
}: ListInvoicesQuery): Promise<PaginatedResult<Invoice[]>> => {
  const where: WhereOptions[] = [];

  if (payment_status) {
    where.push({ payment_status });
  }

  if (customer_id) {
    where.push({ customer_id });
  }

  if (created_by) {
    where.push({ created_by });
  }

  if (date_from || date_to) {
    where.push({
      invoice_date: {
        ...(date_from ? { [Op.gte]: date_from } : {}),
        ...(date_to ? { [Op.lte]: inclusiveEnd(date_to) } : {}),
      },
    });
  }

  if (search) {
    where.push({ invoice_number: { [Op.like]: `%${search}%` } });
  }

  const { rows, count } = await Invoice.findAndCountAll({
    where: where.length ? { [Op.and]: where } : {},
    include: [customerInclude, creatorInclude],
    limit,
    offset: (page - 1) * limit,
    order: [
      ["invoice_date", "DESC"],
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
