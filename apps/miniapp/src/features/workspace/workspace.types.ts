import { ApiClient, Role, SessionUser } from '@/adapters/api/orders.client';

export interface SessionContext {
  token: string;
  user: SessionUser;
}

export type RunAction = (action: () => Promise<unknown>) => Promise<void>;

export interface RoleMeta {
  label: string;
  iconName: Role;
}

export interface AuthPanelProps {
  api: ApiClient;
  tenantId: string;
  setTenantId: (value: string) => void;
  selectedUserId: string;
  setSelectedUserId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  users: SessionUser[];
  session: SessionContext | null;
  run: RunAction;
  setUsers: (users: SessionUser[]) => void;
  setSession: (session: SessionContext | null) => void;
  setTargetClientId: (value: string) => void;
}
