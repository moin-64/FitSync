
export interface Notification {
  id: string;
  type: 'friendRequest' | 'friendAccepted' | 'workout' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  requestId?: string;
  fromUsername?: string;
  actionable?: boolean;
}
