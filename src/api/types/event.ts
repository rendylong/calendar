export interface EventsQueryParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
}

export interface Event {
  id: number;
  uid: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  description: string;
  location?: string;
  user: string;
  guests: string[];
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  category?: string;
  priority?: number;
  created: string;
  lastModified: string;
  timezone?: string;
}