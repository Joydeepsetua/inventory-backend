export type InvoicePaymentStatus =
  | "PENDING"
  | "PAID"
  | "PARTIAL"
  | "CANCELLED";

export type InvoicePaymentMethod = "CASH" | "CARD" | "UPI";

// Who is performing the action — needed wherever ownership decides access.
export interface InvoiceActor {
  id: string;
  role: "OWNER" | "SALESMAN";
}

// The line items are never sent — they are whatever is in the caller's open
// cart at the moment the invoice is created.
export interface CreateInvoiceInput {
  customer_id: string;
  discount_amount: number;
  tax_rate: number;
  payment_status: Exclude<InvoicePaymentStatus, "CANCELLED">;
  payment_method?: InvoicePaymentMethod | null;
  notes?: string | null;
}

export interface UpdateInvoicePaymentInput {
  payment_status: Exclude<InvoicePaymentStatus, "CANCELLED">;
  payment_method?: InvoicePaymentMethod | null;
}

export interface ListInvoicesQuery {
  page: number;
  limit: number;
  search?: string;
  payment_status?: InvoicePaymentStatus;
  customer_id?: string;
  created_by?: string;
  date_from?: Date;
  date_to?: Date;
}
