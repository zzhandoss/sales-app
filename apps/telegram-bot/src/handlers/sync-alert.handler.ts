export const buildSyncDelayAlert = (orderId: string): string => {
  return `Order ${orderId} is delayed due to external sync issue and has been flagged for operator review.`;
};
