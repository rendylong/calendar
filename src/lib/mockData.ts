interface CalendarEvent {
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

let events: CalendarEvent[] = [];

export function initializeCalendarData() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  events = [
    {
      id: 1,
      uid: 'evt-001@example.com',
      title: 'チームミーティング',
      date: formatDate(today),
      time: '10:00',
      endTime: '11:00',
      description: '週次進捗報告',
      location: '会議室A',
      user: 'システム',
      guests: ['team@example.com'],
      status: 'CONFIRMED',
      category: 'MEETING',
      priority: 1,
      created: today.toISOString(),
      lastModified: today.toISOString(),
      timezone: 'Asia/Tokyo'
    },
    {
      id: 2,
      uid: 'evt-002@example.com',
      title: 'プロジェクトレビュー',
      date: formatDate(tomorrow),
      time: '14:00',
      endTime: '15:30',
      description: 'Q1プロジェクトの進捗確認',
      location: 'オンライン',
      user: 'システム',
      guests: ['project@example.com'],
      status: 'CONFIRMED',
      category: 'MEETING',
      priority: 2,
      created: today.toISOString(),
      lastModified: today.toISOString(),
      timezone: 'Asia/Tokyo'
    }
  ];
}

export function getEvents() {
  return events;
}

export function addEvent(event: CalendarEvent) {
  events.push(event);
}

export function updateEvent(eventId: number, updatedEvent: Partial<CalendarEvent>) {
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent };
  }
}

export function deleteEvent(eventId: number) {
  events = events.filter(e => e.id !== eventId);
} 