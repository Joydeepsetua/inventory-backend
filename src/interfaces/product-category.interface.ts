export interface CreateProductCategoryInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateProductCategoryInput
  extends Partial<CreateProductCategoryInput> {}

export type ProductCategoryStatusFilter = "active" | "inactive" | "all";

export interface ListProductCategoriesQuery {
  page: number;
  limit: number;
  search?: string;
  status: ProductCategoryStatusFilter;
}
