export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  history: UserHistory;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: boolean;
  theme: 'light' | 'dark';
}

export interface UserHistory {
  purchases: Purchase[];
  views: ProductView[];
  searches: SearchQuery[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  images: string[];
  inventory: number;
}

export interface Purchase {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  price: number;
  date: Date;
}

export interface ProductView {
  productId: string;
  userId: string;
  timestamp: Date;
  duration: number;
}

export interface SearchQuery {
  query: string;
  userId: string;
  timestamp: Date;
  results: string[];
}

export interface AgentTask {
  id: string;
  type: string;
  payload: any;
  priority: number;
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}