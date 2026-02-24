import { CatalogReadPort, CatalogItemView } from '../query-ports/catalog-read.port';

export class CatalogService {
  constructor(private readonly catalogReadPort: CatalogReadPort) {}

  async listCatalog(tenantId: string, query?: string): Promise<CatalogItemView[]> {
    return this.catalogReadPort.listVisibleItems(tenantId, query);
  }
}
