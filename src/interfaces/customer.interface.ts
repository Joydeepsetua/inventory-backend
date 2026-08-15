export interface CreateCustomerInput {
  name: string;
  email?: string | null;
  phone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gst_number?: string | null;
  is_active?: boolean;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export type CustomerStatusFilter = "active" | "inactive" | "all";

export interface ListCustomersQuery {
  page: number;
  limit: number;
  search?: string;
  status: CustomerStatusFilter;
}
