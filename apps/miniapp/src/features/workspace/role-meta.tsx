import { ShieldCheck, Store, UserRound, WandSparkles } from 'lucide-react';
import { Role } from '@/adapters/api/orders.client';

export const roleLabel: Record<Role, string> = {
  CLIENT: 'Client',
  SALES_AGENT: 'Sales Agent',
  IN_STORE_MANAGER: 'In-Store Manager',
  ADMIN: 'Admin',
};

export const roleIcon = (role: Role) => {
  if (role === 'CLIENT') {
    return <UserRound className="h-4 w-4" />;
  }
  if (role === 'SALES_AGENT') {
    return <WandSparkles className="h-4 w-4" />;
  }
  if (role === 'IN_STORE_MANAGER') {
    return <Store className="h-4 w-4" />;
  }
  return <ShieldCheck className="h-4 w-4" />;
};
