import { useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck, Store, UserCircle2, UserRound, WandSparkles } from 'lucide-react';
import { createApiClient, type Role, type SessionUser } from '@/adapters/api/orders.client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const roleIcon: Record<Role, JSX.Element> = {
  CLIENT: <UserRound className="h-4 w-4" />,
  SALES_AGENT: <WandSparkles className="h-4 w-4" />,
  IN_STORE_MANAGER: <Store className="h-4 w-4" />,
  ADMIN: <ShieldCheck className="h-4 w-4" />,
};

const roleLabel: Record<Role, string> = {
  CLIENT: 'Client',
  SALES_AGENT: 'Sales Agent',
  IN_STORE_MANAGER: 'In-Store Manager',
  ADMIN: 'Admin',
};

type LogValue = unknown;

export function App() {
  const api = useMemo(() => createApiClient(), []);
  const [tenantId, setTenantId] = useState('tenant-demo');
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('client-1');
  const [password, setPassword] = useState('demo12345');
  const [session, setSession] = useState<{ token: string; user: SessionUser } | null>(null);
  const [orderId, setOrderId] = useState('');
  const [targetClientId, setTargetClientId] = useState('client-1');
  const [adminUserId, setAdminUserId] = useState('agent-1');
  const [adminRole, setAdminRole] = useState<Role>('SALES_AGENT');
  const [adminStatus, setAdminStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [log, setLog] = useState<LogValue>({ info: 'Ready' });

  const activeRole = session?.user.role;

  const run = async (action: () => Promise<LogValue>) => {
    try {
      const result = await action();
      setLog(result);
    } catch (error) {
      setLog({ error: error instanceof Error ? error.message : String(error) });
    }
  };

  const requireSession = () => {
    if (!session) {
      throw new Error('Login first');
    }
    return session;
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">SalesApp Command Board</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          shadcn-driven web workspace for auth, roles, and primary role flows.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Login with demo credentials from API and activate role panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Tenant</p>
              <Input value={tenantId} onChange={(event) => setTenantId(event.target.value)} />
            </div>
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">User Id</p>
              <Input value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} />
            </div>
            <div>
              <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Password</p>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  run(async () => {
                    const response = await api.listDemoUsers(tenantId);
                    setUsers(response.users);
                    if (response.users[0]) {
                      setSelectedUserId(response.users[0].userId);
                    }
                    return response;
                  })
                }
              >
                Load Users
              </Button>
              <Button
                className="w-full"
                onClick={() =>
                  run(async () => {
                    const response = await api.login(tenantId, selectedUserId, password);
                    setSession({ token: response.accessToken, user: response.user });
                    setTargetClientId(response.user.userId);
                    return response;
                  })
                }
              >
                Login
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={session ? 'default' : 'secondary'}>{session ? `Role: ${session.user.role}` : 'No session'}</Badge>
            {session && (
              <div className="flex items-center gap-2 rounded-md border border-[var(--border)] px-2 py-1">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>
                    <UserCircle2 className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{session.user.displayName}</span>
              </div>
            )}
          </div>

          {users.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <Button
                  key={user.userId}
                  size="sm"
                  variant={selectedUserId === user.userId ? 'default' : 'outline'}
                  onClick={() => setSelectedUserId(user.userId)}
                >
                  {roleIcon[user.role]}
                  {user.userId}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {activeRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {roleIcon[activeRole]}
              {roleLabel[activeRole]} Flow
            </CardTitle>
            <CardDescription>Primary operational actions for active role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(activeRole === 'SALES_AGENT' || activeRole === 'IN_STORE_MANAGER') && (
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Target Client</p>
                  <Input value={targetClientId} onChange={(event) => setTargetClientId(event.target.value)} />
                </div>
                {activeRole === 'IN_STORE_MANAGER' && (
                  <div>
                    <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Order Id</p>
                    <Input value={orderId} onChange={(event) => setOrderId(event.target.value)} />
                  </div>
                )}
              </div>
            )}

            {activeRole === 'ADMIN' && (
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">User Id</p>
                  <Input value={adminUserId} onChange={(event) => setAdminUserId(event.target.value)} />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Role</p>
                  <select
                    className="flex h-10 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm"
                    value={adminRole}
                    onChange={(event) => setAdminRole(event.target.value as Role)}
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
                    value={adminStatus}
                    onChange={(event) => setAdminStatus(event.target.value as 'ACTIVE' | 'DISABLED')}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  run(async () => {
                    const current = requireSession();
                    return api.listCatalog(current.user.tenantId, current.token);
                  })
                }
              >
                Catalog
              </Button>

              {activeRole === 'CLIENT' && (
                <>
                  <Button
                    onClick={() =>
                      run(async () => {
                        const current = requireSession();
                        const created = await api.createSelfOrder({
                          tenantId: current.user.tenantId,
                          token: current.token,
                          clientUserId: current.user.userId,
                          productId: 'sku-100',
                          qty: 2,
                          unitPrice: 18,
                        });
                        setOrderId(created.orderId);
                        return created;
                      })
                    }
                  >
                    Create Order
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      run(async () => {
                        const current = requireSession();
                        return api.confirmFulfillment(current.user.tenantId, current.token, orderId);
                      })
                    }
                  >
                    Confirm Fulfillment
                  </Button>
                </>
              )}

              {(activeRole === 'SALES_AGENT' || activeRole === 'IN_STORE_MANAGER') && (
                <Button
                  onClick={() =>
                    run(async () => {
                      const current = requireSession();
                      const created = await api.createAssistedOrder({
                        tenantId: current.user.tenantId,
                        token: current.token,
                        clientUserId: targetClientId,
                        productId: 'sku-200',
                        qty: 1,
                        unitPrice: 42,
                      });
                      setOrderId(created.orderId);
                      return created;
                    })
                  }
                >
                  Assisted Order
                </Button>
              )}

              {activeRole === 'IN_STORE_MANAGER' && (
                <Button
                  variant="destructive"
                  onClick={() =>
                    run(async () => {
                      const current = requireSession();
                      return api.cancelOrder(current.user.tenantId, current.token, orderId);
                    })
                  }
                >
                  Cancel Order
                </Button>
              )}

              {activeRole === 'ADMIN' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      run(async () => {
                        const current = requireSession();
                        return api.listAdminUsers(current.user.tenantId, current.token);
                      })
                    }
                  >
                    List Users
                  </Button>
                  <Button
                    onClick={() =>
                      run(async () => {
                        const current = requireSession();
                        return api.updateAdminAccess({
                          tenantId: current.user.tenantId,
                          token: current.token,
                          userId: adminUserId,
                          role: adminRole,
                          status: adminStatus,
                        });
                      })
                    }
                  >
                    Update Access
                  </Button>
                </>
              )}

              {orderId && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    run(async () => {
                      const current = requireSession();
                      return api.getOrderStatus(current.user.tenantId, current.token, orderId);
                    })
                  }
                >
                  Status <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Output</CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <pre className="overflow-auto rounded-md border border-[var(--border)] bg-black/20 p-3 text-xs">
            {JSON.stringify(log, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </main>
  );
}
