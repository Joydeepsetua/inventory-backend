export interface CreateProductInput {
  category_id: string;
  name: string;
  description?: string | null;
  brand?: string | null;
  is_active?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export type ProductStatusFilter = "active" | "inactive" | "all";

export interface ListProductsQuery {
  page: number;
  limit: number;
  search?: string;
  status: ProductStatusFilter;
  category_id?: string;
}
