import { OrderRepo, UserRole } from '../../modules/orders/repos/order.repo';

export class ListOrdersUseCase {
  constructor(private readonly orderRepo: OrderRepo) {}

  async execute(input: {
    tenantId: string;
    actorUserId: string;
    role: UserRole;
  }) {
    return this.orderRepo.listForActor(input.tenantId, input.actorUserId, input.role);
  }
}
