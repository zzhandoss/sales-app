export const handleOrderStatus = (orderId: string): string => {
  return `Status requested for ${orderId}`;
};

export const handleOrderConfirm = (orderId: string): string => {
  return `Confirmation sent for ${orderId}`;
};
