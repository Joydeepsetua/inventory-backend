import { InvoicePaymentStatus } from "./invoice.interface.js";

export interface DashboardSummaryQuery {
  days: number;
  tz_offset: number;
}

export interface DashboardStats {
  today_sales: string;
  today_count: number;
  pending_invoice_count: number;
  customer_count: number;
}

export interface PaymentStatusCount {
  status: InvoicePaymentStatus;
  count: number;
}

export interface SalesTrendPoint {
  date: string;
  total: string;
  count: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  payment_status: PaymentStatusCount[];
  sales_trend: SalesTrendPoint[];
}
