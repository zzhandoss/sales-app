import { UserCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { roleIcon } from './role-meta';
import { AuthPanelProps } from './workspace.types';

export function AuthPanel(props: AuthPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>Login with demo credentials from API and activate role panel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Tenant</p>
            <Input value={props.tenantId} onChange={(event) => props.setTenantId(event.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">User Id</p>
            <Input
              value={props.selectedUserId}
              onChange={(event) => props.setSelectedUserId(event.target.value)}
            />
          </div>
          <div>
            <p className="mb-1 text-xs uppercase text-[var(--muted-foreground)]">Password</p>
            <Input
              type="password"
              value={props.password}
              onChange={(event) => props.setPassword(event.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                props.run(async () => {
                  const response = await props.api.listDemoUsers(props.tenantId);
                  props.setUsers(response.users);
                  if (response.users[0]) {
                    props.setSelectedUserId(response.users[0].userId);
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
                props.run(async () => {
                  const response = await props.api.login(
                    props.tenantId,
                    props.selectedUserId,
                    props.password,
                  );
                  props.setSession({ token: response.accessToken, user: response.user });
                  props.setTargetClientId(response.user.userId);
                  return response;
                })
              }
            >
              Login
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={props.session ? 'default' : 'secondary'}>
            {props.session ? `Role: ${props.session.user.role}` : 'No session'}
          </Badge>
          {props.session && (
            <div className="flex items-center gap-2 rounded-md border border-[var(--border)] px-2 py-1">
              <Avatar className="h-7 w-7">
                <AvatarFallback>
                  <UserCircle2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{props.session.user.displayName}</span>
            </div>
          )}
        </div>

        {props.users.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {props.users.map((user) => (
              <Button
                key={user.userId}
                size="sm"
                variant={props.selectedUserId === user.userId ? 'default' : 'outline'}
                onClick={() => props.setSelectedUserId(user.userId)}
              >
                {roleIcon(user.role)}
                {user.userId}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
