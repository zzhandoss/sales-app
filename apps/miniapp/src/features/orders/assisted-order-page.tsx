export interface AssistedOrderPageView {
  title: string;
  description: string;
}

export const getAssistedOrderPageView = (): AssistedOrderPageView => {
  return {
    title: 'Assisted Order',
    description: 'Select client and submit assisted order.',
  };
};

