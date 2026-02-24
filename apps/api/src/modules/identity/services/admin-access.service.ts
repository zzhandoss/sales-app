export interface AdminAccessChange {
  userId: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED';
}

export class AdminAccessService {
  private readonly changes: AdminAccessChange[] = [];

  updateAccess(change: AdminAccessChange): void {
    this.changes.push(change);
  }

  listChanges(): AdminAccessChange[] {
    return [...this.changes];
  }
}
