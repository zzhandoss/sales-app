export const createCorrelationId = (): string => {
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};
