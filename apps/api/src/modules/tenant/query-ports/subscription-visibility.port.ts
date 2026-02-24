export interface SubscriptionVisibility {
  tenantId: string;
  isVisible: boolean;
  plan: string;
}

export interface SubscriptionVisibilityPort {
  getVisibility(tenantId: string): Promise<SubscriptionVisibility>;
}
