export interface CatalogItemContract {
  productId: string;
  name: string;
  price: number;
  currency: string;
  availableQty: number;
}

export interface OrderContract {
  orderId: string;
  state: string;
}
