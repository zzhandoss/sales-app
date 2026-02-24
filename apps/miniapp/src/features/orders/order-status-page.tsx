export interface OrderStatusPageView {
  title: string;
  description: string;
}

export const getOrderStatusPageView = (): OrderStatusPageView => {
  return {
    title: 'Order Status',
    description: 'Status timeline and fulfillment confirmation action.',
  };
};

