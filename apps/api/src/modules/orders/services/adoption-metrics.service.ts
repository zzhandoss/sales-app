export class AdoptionMetricsService {
  private selfServiceOrders = 0;

  incrementSelfServiceOrders(): void {
    this.selfServiceOrders += 1;
  }

  getSelfServiceOrders(): number {
    return this.selfServiceOrders;
  }
}
