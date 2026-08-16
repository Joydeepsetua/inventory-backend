export interface CreateProductVariantInput {
  product_id: string;
  sku: string;
  name: string;
  price?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
}

export interface UpdateProductVariantInput
  extends Partial<CreateProductVariantInput> {}

export type ProductVariantStatusFilter = "active" | "inactive" | "all";

export interface ListProductVariantsQuery {
  page: number;
  limit: number;
  search?: string;
  status: ProductVariantStatusFilter;
  product_id?: string;
  category_id?: string;
  low_stock?: boolean;
}
