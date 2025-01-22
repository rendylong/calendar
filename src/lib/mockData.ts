interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
}

let events: CalendarEvent[] = [];

export function initializeCalendarData() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  events = [
    {
      id: '1',
      title: 'チームミーティング',
      start: new Date(today.setHours(10, 0)),
      end: new Date(today.setHours(11, 0)),
      description: '週次進捗報告',
      location: '会議室A',
      attendees: ['team@example.com']
    },
    {
      id: '2',
      title: 'プロジェクトレビュー',
      start: new Date(tomorrow.setHours(14, 0)),
      end: new Date(tomorrow.setHours(15, 30)),
      description: 'Q1プロジェクトの進捗確認',
      location: 'オンライン',
      attendees: ['project@example.com']
    }
  ];
}

export function getEvents() {
  return events;
}

export function addEvent(event: CalendarEvent) {
  events.push(event);
}

export function updateEvent(eventId: string, updatedEvent: Partial<CalendarEvent>) {
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent };
  }
}

export function deleteEvent(eventId: string) {
  events = events.filter(e => e.id !== eventId);
} 