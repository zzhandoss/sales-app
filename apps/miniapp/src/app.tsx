import { useMemo, useState } from 'react';
import { Role, SessionUser, createApiClient } from '@/adapters/api/orders.client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthPanel } from './features/workspace/auth-panel';
import { RoleFlowPanel } from './features/workspace/role-flow-panel';
import { SessionContext } from './features/workspace/workspace.types';

type LogValue = unknown;

export function App() {
  const api = useMemo(() => createApiClient(), []);
  const [tenantId, setTenantId] = useState('tenant-demo');
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('client-1');
  const [password, setPassword] = useState('demo12345');
  const [session, setSession] = useState<SessionContext | null>(null);
  const [orderId, setOrderId] = useState('');
  const [targetClientId, setTargetClientId] = useState('client-1');
  const [adminUserId, setAdminUserId] = useState('agent-1');
  const [adminRole, setAdminRole] = useState<Role>('SALES_AGENT');
  const [adminStatus, setAdminStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [deadLetterId, setDeadLetterId] = useState('');
  const [log, setLog] = useState<LogValue>({ info: 'Ready' });

  const run = async (action: () => Promise<LogValue>) => {
    try {
      const result = await action();
      setLog(result);
    } catch (error) {
      setLog({ error: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">SalesApp Command Board</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          shadcn-driven web workspace for auth, roles, and operational order flows.
        </p>
      </header>

      <AuthPanel
        api={api}
        tenantId={tenantId}
        setTenantId={setTenantId}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        password={password}
        setPassword={setPassword}
        users={users}
        setUsers={setUsers}
        session={session}
        setSession={setSession}
        setTargetClientId={setTargetClientId}
        run={run}
      />

      {session && (
        <RoleFlowPanel
          api={api}
          session={session}
          activeRole={session.user.role}
          orderId={orderId}
          setOrderId={setOrderId}
          targetClientId={targetClientId}
          setTargetClientId={setTargetClientId}
          adminUserId={adminUserId}
          setAdminUserId={setAdminUserId}
          adminRole={adminRole}
          setAdminRole={setAdminRole}
          adminStatus={adminStatus}
          setAdminStatus={setAdminStatus}
          deadLetterId={deadLetterId}
          setDeadLetterId={setDeadLetterId}
          run={run}
        />
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
