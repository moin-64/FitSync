
export interface Friend {
  id: string;
  username: string;
  since?: string;
  workoutsCompleted?: number;
  maxWeight?: number;
  avgWorkoutDuration?: number;
  rank?: string;
  lastActive?: string;
  stats?: {
    workoutsCompleted: number;
    maxWeight: number;
    avgWorkoutDuration: number;
    rank: string;
    lastActive: string;
  };
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined';
}
