import { NextResponse } from 'next/server';

export async function GET() {
  // 模拟的会议数据
  const mockEvents = [
    {
      id: 1,
      uid: "evt-001@example.com",
      title: "週次ミーティング",
      date: "2025-01-15",
      time: "09:00",
      endTime: "10:00",
      description: "週次の進捗報告会議",
      location: "会議室A",
      user: "山田太郎",
      guests: ["tanaka@example.com", "suzuki@example.com"],
      status: "CONFIRMED",
      category: "MEETING",
      priority: 2,
      created: "2024-03-01T10:00:00Z",
      lastModified: "2024-03-01T10:00:00Z",
      timezone: "Asia/Tokyo"
    },
    // 可以添加更多测试数据...
  ];

  return NextResponse.json({
    success: true,
    data: {
      events: mockEvents,
      total: mockEvents.length
    }
  });
}