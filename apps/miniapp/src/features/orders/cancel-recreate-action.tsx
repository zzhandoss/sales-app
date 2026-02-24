export interface CancelRecreateActionView {
  label: string;
}

export const getCancelRecreateActionView = (): CancelRecreateActionView => {
  return {
    label: 'Cancel and create new order',
  };
};

