import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { EventsQueryParams, EventsResponse, Event } from './types/event';



export const eventApi = {
  // 获取会议列表的方法
  getEvents: async (params?: EventsQueryParams) => {
    return apiClient.get<EventsResponse>(ENDPOINTS.events.list, params as Record<string, string>);
  },

  // 创建会议的方法
  createEvent: async (eventData: Omit<Event, 'id' | 'uid' | 'created' | 'lastModified'>) => {
    return apiClient.post<Event>(ENDPOINTS.events.create, eventData);
  }
};