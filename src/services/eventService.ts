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
    },
    /**
     * 更新会议
     */
    async updateEvent(eventId: number, eventData: Partial<Event>): Promise<Event | null> {
        try {
            const response = await eventApi.updateEvent(eventId, eventData);
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('更新会议失败:', error);
            return null;
        }
    },
    /**
     * 删除会议
     */
    async deleteEvent(eventId: number): Promise<boolean> {
        try {
            const response = await eventApi.deleteEvent(eventId);
            return response.success;
        } catch (error) {
            console.error('删除会议失败:', error);
            return false;
        }
    }
};