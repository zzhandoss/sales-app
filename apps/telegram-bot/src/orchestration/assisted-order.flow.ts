export interface AssistedOrderContext {
  clientUserId: string;
  actorUserId: string;
}

export const startAssistedOrderFlow = (ctx: AssistedOrderContext): string => {
  return `Assisted order started for ${ctx.clientUserId} by ${ctx.actorUserId}`;
};
