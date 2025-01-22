import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { EventsQueryParams, EventsResponse, Event } from './types/event';
import type { ApiResponse } from './types/event';

export const eventApi = {
  // 获取会议列表的方法
  getEvents: async (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<EventsResponse>> => {
    return apiClient.get<EventsResponse>(ENDPOINTS.events.list, params);
  },

  // 创建会议的方法
  createEvent: async (eventData: Omit<Event, 'id' | 'uid' | 'created' | 'lastModified'>): Promise<ApiResponse<Event>> => {
    return apiClient.post<Event>(ENDPOINTS.events.create, eventData);
  },

  // 更新会议的方法
  updateEvent: async (eventId: number, eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
    return apiClient.put<Event>(`${ENDPOINTS.events.list}/${eventId}`, eventData);
  },

  // 删除会议的方法
  deleteEvent: async (eventId: number): Promise<ApiResponse<void>> => {
    return apiClient.delete(`${ENDPOINTS.events.list}/${eventId}`);
  }
};