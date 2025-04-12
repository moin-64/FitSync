
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string; // Adding createdAt as an optional property
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  retryAuth: () => Promise<void>;
}
