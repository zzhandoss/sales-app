export class OnboardingMetricsService {
  private readonly tenantLeadTimes = new Map<string, number>();

  setLeadTimeHours(tenantId: string, hours: number): void {
    this.tenantLeadTimes.set(tenantId, hours);
  }

  getLeadTimeHours(tenantId: string): number | undefined {
    return this.tenantLeadTimes.get(tenantId);
  }
}
