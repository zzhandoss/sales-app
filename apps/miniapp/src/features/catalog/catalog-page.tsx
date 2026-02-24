import { createOrder } from '../../adapters/api/orders.client';

interface CatalogItem {
  productId: string;
  name: string;
  unitPrice: number;
}

interface CatalogPageState {
  selected: Record<string, number>;
  total: number;
  items: CatalogItem[];
}

const seedItems: CatalogItem[] = [
  { productId: 'sku-1', name: 'Sample Item 1', unitPrice: 10 },
  { productId: 'sku-2', name: 'Sample Item 2', unitPrice: 15 },
];

export const createCatalogPageState = (selected: Record<string, number>): CatalogPageState => {
  const total = seedItems.reduce(
    (acc, item) => acc + (selected[item.productId] ?? 0) * item.unitPrice,
    0,
  );
  return { selected, total, items: seedItems };
};

export const submitCatalogOrder = async (selected: Record<string, number>): Promise<void> => {
  const lines = seedItems
    .filter((item) => (selected[item.productId] ?? 0) > 0)
    .map((item) => ({
      productId: item.productId,
      qty: selected[item.productId],
      unitPrice: item.unitPrice,
    }));

  await createOrder(
    {
      clientUserId: 'client-demo',
      lines,
    },
    `idem-${Date.now()}`,
  );
};

