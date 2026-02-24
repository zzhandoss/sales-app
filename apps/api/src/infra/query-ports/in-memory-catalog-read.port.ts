import { CatalogItemView, CatalogReadPort } from '../../modules/catalog/query-ports/catalog-read.port';

const catalogByTenant: Record<string, CatalogItemView[]> = {
  'tenant-demo': [
    {
      productId: 'sku-100',
      name: 'Industrial Fastener Box',
      price: 18,
      currency: 'USD',
      availableQty: 240,
    },
    {
      productId: 'sku-200',
      name: 'Precision Bearing Kit',
      price: 42,
      currency: 'USD',
      availableQty: 87,
    },
    {
      productId: 'sku-300',
      name: 'Hydraulic Seal Pack',
      price: 11,
      currency: 'USD',
      availableQty: 520,
    },
  ],
};

export class InMemoryCatalogReadPort implements CatalogReadPort {
  async listVisibleItems(tenantId: string, query?: string): Promise<CatalogItemView[]> {
    const items = catalogByTenant[tenantId] ?? [];
    if (!query) {
      return items;
    }
    const normalizedQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.productId.toLowerCase().includes(normalizedQuery),
    );
  }
}
