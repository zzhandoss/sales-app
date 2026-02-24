import { ArrowRight } from 'lucide-react';
import { ApiClient, Role } from '@/adapters/api/orders.client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { roleIcon, roleLabel } from './role-meta';
import { RunAction, SessionContext } from './workspace.types';

interface RoleFlowPanelProps {
  api: ApiClient;
  session: SessionContext;
  activeRole: Role;
  orderId: string;
  setOrderId: (value: string) => void;
  targetClientId: string;
  setTargetClientId: (value: string) => void;
  adminUserId: string;
  setAdminUserId: (value: string) => void;
  adminRole: Role;
  setAdminRole: (value: Role) => void;
  adminStatus: 'ACTIVE' | 'DISABLED';
  setAdminStatus: (value: 'ACTIVE' | 'DISABLED') => void;
  deadLetterId: string;
  setDeadLetterId: (value: string) => void;
  run: RunAction;
}

export function RoleFlowPanel(props: RoleFlowPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {roleIcon(props.activeRole)}
          {roleLabel[props.activeRole]} Flow
        </CardTitle>
        <CardDescription>Primary operational actions for active role.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(props.activeRole === 'SALES_AGENT' || props.activeRole === 'IN_STORE_MANAGER') && (
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Target Client</p>
              <Input
                value={props.targetClientId}
                onChange={(event) => props.setTargetClientId(event.target.value)}
              />
            </div>
            {props.activeRole === 'IN_STORE_MANAGER' && (
              <div>
                <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Order Id</p>
                <Input value={props.orderId} onChange={(event) => props.setOrderId(event.target.value)} />
              </div>
            )}
          </div>
        )}

        {props.activeRole === 'ADMIN' && (
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">User Id</p>
              <Input value={props.adminUserId} onChange={(event) => props.setAdminUserId(event.target.value)} />
            </div>
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Role</p>
              <select
                className="flex h-10 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm"
                value={props.adminRole}
                onChange={(event) => props.setAdminRole(event.target.value as Role)}
              >
                <option value="CLIENT">CLIENT</option>
                <option value="SALES_AGENT">SALES_AGENT</option>
                <option value="IN_STORE_MANAGER">IN_STORE_MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Status</p>
              <select
                className="flex h-10 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm"
                value={props.adminStatus}
                onChange={(event) => props.setAdminStatus(event.target.value as 'ACTIVE' | 'DISABLED')}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DISABLED">DISABLED</option>
              </select>
            </div>
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Dead-Letter Id</p>
              <Input
                value={props.deadLetterId}
                onChange={(event) => props.setDeadLetterId(event.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => props.run(async () => props.api.listCatalog(props.session.user.tenantId, props.session.token))}
          >
            Catalog
          </Button>
          <Button
            variant="outline"
            onClick={() => props.run(async () => props.api.listOrders(props.session.user.tenantId, props.session.token))}
          >
            My Orders
          </Button>

          {props.activeRole === 'CLIENT' && (
            <>
              <Button
                onClick={() =>
                  props.run(async () => {
                    const created = await props.api.createSelfOrder({
                      tenantId: props.session.user.tenantId,
                      token: props.session.token,
                      clientUserId: props.session.user.userId,
                      productId: 'sku-100',
                      qty: 2,
                      unitPrice: 18,
                    });
                    props.setOrderId(created.orderId);
                    return created;
                  })
                }
              >
                Create Order
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  props.run(async () =>
                    props.api.confirmFulfillment(props.session.user.tenantId, props.session.token, props.orderId),
                  )
                }
              >
                Confirm Fulfillment
              </Button>
            </>
          )}

          {(props.activeRole === 'SALES_AGENT' || props.activeRole === 'IN_STORE_MANAGER') && (
            <Button
              onClick={() =>
                props.run(async () => {
                  const created = await props.api.createAssistedOrder({
                    tenantId: props.session.user.tenantId,
                    token: props.session.token,
                    clientUserId: props.targetClientId,
                    productId: 'sku-200',
                    qty: 1,
                    unitPrice: 42,
                  });
                  props.setOrderId(created.orderId);
                  return created;
                })
              }
            >
              Assisted Order
            </Button>
          )}

          {props.activeRole === 'IN_STORE_MANAGER' && (
            <Button
              variant="destructive"
              onClick={() =>
                props.run(async () => props.api.cancelOrder(props.session.user.tenantId, props.session.token, props.orderId))
              }
            >
              Cancel Order
            </Button>
          )}

          {props.activeRole === 'ADMIN' && (
            <>
              <Button
                variant="secondary"
                onClick={() =>
                  props.run(async () => props.api.listAdminUsers(props.session.user.tenantId, props.session.token))
                }
              >
                List Users
              </Button>
              <Button
                onClick={() =>
                  props.run(async () =>
                    props.api.updateAdminAccess({
                      tenantId: props.session.user.tenantId,
                      token: props.session.token,
                      userId: props.adminUserId,
                      role: props.adminRole,
                      status: props.adminStatus,
                    }),
                  )
                }
              >
                Update Access
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  props.run(async () => props.api.listDeadLetters(props.session.user.tenantId, props.session.token))
                }
              >
                Dead Letters
              </Button>
              <Button
                onClick={() =>
                  props.run(async () =>
                    props.api.retryDeadLetter(
                      props.session.user.tenantId,
                      props.session.token,
                      props.deadLetterId,
                    ),
                  )
                }
              >
                Retry Dead Letter
              </Button>
            </>
          )}

          {props.orderId && (
            <Button
              variant="ghost"
              onClick={() =>
                props.run(async () => props.api.getOrderStatus(props.session.user.tenantId, props.session.token, props.orderId))
              }
            >
              Status <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
