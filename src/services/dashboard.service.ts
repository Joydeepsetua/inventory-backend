import { Op, col, fn, literal } from "sequelize";

import Customer from "../models/customer.model.js";
import Invoice from "../models/invoice.model.js";
import {
  DashboardSummary,
  DashboardSummaryQuery,
  PaymentStatusCount,
  SalesTrendPoint,
} from "../interfaces/dashboard.interface.js";
import { InvoicePaymentStatus } from "../interfaces/invoice.interface.js";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const PAYMENT_STATUSES: InvoicePaymentStatus[] = [
  "PENDING",
  "PAID",
  "PARTIAL",
  "CANCELLED",
];

const money = (value: unknown) => Number(value ?? 0).toFixed(2);

// localDayKeys(7, -330) on 2026-08-22 04:15 IST (2026-08-21 22:45 UTC):
// [
//   "2026-08-16",
//   "2026-08-17",
//   "2026-08-18",
//   "2026-08-19",
//   "2026-08-20",
//   "2026-08-21",
//   "2026-08-22",
// ]
// Oldest first, today last. The UTC clock still reads 2026-08-21 here, so
// without the offset the last key would be "2026-08-21" and every bill billed
// after 05:30 IST would land in the wrong day.
//
// localDayKeys(3, 0) at the same instant: ["2026-08-19", "2026-08-20", "2026-08-21"]
const localDayKeys = (days: number, tzOffset: number) => {
  const localNow = Date.now() - tzOffset * MINUTE_MS;

  return Array.from({ length: days }, (_, index) =>
    new Date(localNow - (days - 1 - index) * DAY_MS).toISOString().slice(0, 10)
  );
};

const utcInstant = (dayKey: string, timePart: string, tzOffset: number) =>
  new Date(new Date(`${dayKey}T${timePart}Z`).getTime() + tzOffset * MINUTE_MS);

const salesTrend = async (
  dayKeys: string[],
  tzOffset: number
): Promise<SalesTrendPoint[]> => {
  const localDate = fn(
    "DATE_FORMAT",
    literal(`invoice_date + INTERVAL ${-tzOffset} MINUTE`),
    "%Y-%m-%d"
  );

  const rows = (await Invoice.findAll({
    attributes: [
      [localDate, "day"],
      [fn("SUM", col("total_amount")), "total"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      payment_status: { [Op.ne]: "CANCELLED" },
      invoice_date: {
        [Op.between]: [
          utcInstant(dayKeys[0], "00:00:00.000", tzOffset),
          utcInstant(
            dayKeys[dayKeys.length - 1],
            "23:59:59.999",
            tzOffset
          ),
        ],
      },
    },
    group: [localDate],
    raw: true,
  })) as unknown as { day: string; total: string | null; count: number }[];

  const byDay = new Map(rows.map((row) => [row.day, row]));

  return dayKeys.map((day) => {
    const row = byDay.get(day);

    return {
      date: day,
      total: money(row?.total),
      count: Number(row?.count ?? 0),
    };
  });
};

const paymentStatusCounts = async (): Promise<PaymentStatusCount[]> => {
  const rows = (await Invoice.findAll({
    attributes: ["payment_status", [fn("COUNT", col("id")), "count"]],
    group: ["payment_status"],
    raw: true,
  })) as unknown as {
    payment_status: InvoicePaymentStatus;
    count: number;
  }[];

  const byStatus = new Map(rows.map((row) => [row.payment_status, row.count]));

  return PAYMENT_STATUSES.map((status) => ({
    status,
    count: Number(byStatus.get(status) ?? 0),
  }));
};

export const getDashboardSummary = async ({
  days,
  tz_offset,
}: DashboardSummaryQuery): Promise<DashboardSummary> => {
  const dayKeys = localDayKeys(days, tz_offset);

  const [trend, statuses, customerCount] = await Promise.all([
    salesTrend(dayKeys, tz_offset),
    paymentStatusCounts(),
    Customer.count({ where: { is_active: true } }),
  ]);

  const today = trend[trend.length - 1];

  const pending = statuses.find((entry) => entry.status === "PENDING");

  return {
    stats: {
      today_sales: today.total,
      today_count: today.count,
      pending_invoice_count: pending?.count ?? 0,
      customer_count: customerCount,
    },
    payment_status: statuses,
    sales_trend: trend,
  };
};
