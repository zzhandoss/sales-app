import { startAssistedOrderFlow } from '../orchestration/assisted-order.flow';

export const handleOrderCommand = (actorUserId: string, clientUserId: string): string => {
  return startAssistedOrderFlow({ actorUserId, clientUserId });
};
