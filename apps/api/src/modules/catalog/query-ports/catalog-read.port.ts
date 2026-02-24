export interface CatalogItemView {
  productId: string;
  name: string;
  price: number;
  currency: string;
  availableQty: number;
}

export interface CatalogReadPort {
  listVisibleItems(tenantId: string, query?: string): Promise<CatalogItemView[]>;
}
