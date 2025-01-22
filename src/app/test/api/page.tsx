'use client';
import { useState } from 'react';
import { eventService } from '@/services/eventService';
import type { Event } from '@/api/types/event';

export default function TestApiPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEvents({
        startDate: '2024-03-01',
        endDate: '2024-03-31'
      });
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API 测试页面</h1>

      <button
        onClick={fetchEvents}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        获取会议列表
      </button>

      {loading && <div className="text-gray-500">加载中...</div>}

      {error && (
        <div className="text-red-500 mb-4">
          错误: {error}
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">会议列表：</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(events, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}