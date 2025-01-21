import {eventApi} from '@/api/events';
import type {Event, EventsQueryParams} from '@/api/types/event';

export const eventService = {
    /**
     * 获取会议列表
     * 这里可以添加业务逻辑，如数据转换、缓存等
     */
    async getEvents(params?: EventsQueryParams): Promise<Event[]> {
        try {
            const response = await eventApi.getEvents(params);
            if (response.success) {
                return response.data.events;
            }
            return [];
        } catch (error) {
            console.error('获取会议列表失败:', error);
            return [];
        }
    },
    /**
     * 创建会议
     * 这里可以添加业务逻辑，如数据转换、缓存等
     */
    async createEvent(eventData: Omit<Event, 'id' | 'uid' | 'created' | 'lastModified'>): Promise<Event | null> {
        console.log('eventData:', eventData);
        try {
            const response = await eventApi.createEvent(eventData);
            if (response.success && response.data) {
                return response.data;
            } else if (response.error) {
                debugger
                return null
            }
            return null;
        } catch (error) {
            console.error('创建会议失败:', error);
            return null;
        }
    }
};