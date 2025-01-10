'use client';

import React, { useState, useEffect, useRef } from 'react';
import EventForm from './EventForm';
import EventDetail from './EventDetail';

interface Event {
  id: number;
  uid: string;                    // iCalendar UID
  title: string;                  // iCalendar SUMMARY
  date: string;
  time: string;
  endTime: string;
  description: string;            // iCalendar DESCRIPTION
  location?: string;              // iCalendar LOCATION
  user: string;                   // iCalendar ORGANIZER
  guests: string[];               // iCalendar ATTENDEE
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';  // iCalendar STATUS
  category?: string;              // iCalendar CATEGORIES
  priority?: number;              // iCalendar PRIORITY (0-9)
  recurrence?: {                  // iCalendar RRULE
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    until?: string;
    count?: number;
    byDay?: string[];            // e.g., ['MO', 'WE', 'FR']
  };
  created: string;               // iCalendar DTSTAMP
  lastModified: string;          // iCalendar LAST-MODIFIED
  timezone?: string;             // iCalendar TZID
}

// Mock user
const currentUser = {
  name: '山田太郎',
  email: 'yamada.taro@example.com'
};

// Updated mock data with new fields
const mockEvents: Event[] = [
  { 
    id: 1,
    uid: 'evt-001@example.com',
    title: 'チーム会議',
    date: '2024-01-10',
    time: '10:00',
    endTime: '11:00',
    description: '週次プロジェクトの進捗確認',
    location: '会議室A',
    user: currentUser.name,
    guests: ['suzuki@example.com', 'tanaka@example.com'],
    status: 'CONFIRMED',
    category: 'MEETING',
    priority: 2,
    recurrence: {
      frequency: 'WEEKLY',
      byDay: ['WE'],
      count: 12
    },
    created: '2024-01-01T09:00:00',
    lastModified: '2024-01-01T09:00:00',
    timezone: 'Asia/Tokyo'
  },
  { 
    id: 2,
    uid: 'evt-002@example.com',
    title: 'プロジェクトレビュー',
    date: '2024-01-15',
    time: '14:30',
    endTime: '16:00',
    description: 'Q1目標の達成状況確認',
    location: 'オンライン',
    user: '山田花子',
    guests: [],
    status: 'CONFIRMED',
    category: 'REVIEW',
    priority: 1,
    created: '2024-01-01T09:00:00',
    lastModified: '2024-01-01T09:00:00',
    timezone: 'Asia/Tokyo'
  },
  { 
    id: 3,
    uid: 'evt-003@example.com',
    title: '顧客面談',
    date: '2024-01-20',
    time: '09:00',
    endTime: '10:30',
    description: '新規提案についての打ち合わせ',
    location: '会議室B',
    user: '鈴木一郎',
    guests: [],
    status: 'CONFIRMED',
    category: 'MEETING',
    priority: 1,
    created: '2024-01-01T09:00:00',
    lastModified: '2024-01-01T09:00:00',
    timezone: 'Asia/Tokyo'
  },
  { 
    id: 4,
    uid: 'evt-004@example.com',
    title: '部署会議',
    date: '2024-01-10',
    time: '15:00',
    endTime: '16:00',
    description: '来月の計画について',
    location: '大会議室',
    user: '佐藤めぐみ',
    guests: [],
    status: 'CONFIRMED',
    category: 'MEETING',
    priority: 2,
    created: '2024-01-01T09:00:00',
    lastModified: '2024-01-01T09:00:00',
    timezone: 'Asia/Tokyo'
  },
  { 
    id: 5,
    uid: 'evt-005@example.com',
    title: 'トレーニング',
    date: '2024-01-15',
    time: '13:00',
    endTime: '14:00',
    description: '新システムの使用方法',
    location: 'トレーニングルーム',
    user: '高橋健一',
    guests: [],
    status: 'CONFIRMED',
    category: 'TRAINING',
    priority: 3,
    created: '2024-01-01T09:00:00',
    lastModified: '2024-01-01T09:00:00',
    timezone: 'Asia/Tokyo'
  }
];

const getInitialDate = () => {
  // Use local time instead of UTC
  return new Date(2024, 0, 1, 0, 0, 0);
};

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

type ViewMode = 'month' | 'week';

const timeSlots = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  label: `${String(i).padStart(2, '0')}:00`,
}));

interface ClientOnlyProps {
  children: React.ReactNode;
}

const ClientOnly = ({ children }: ClientOnlyProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formPosition, setFormPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const weekViewRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Load events from localStorage on component mount
  useEffect(() => {
    if (isClient) {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        try {
          const parsedEvents = JSON.parse(savedEvents);
          setEvents(parsedEvents);
        } catch (error) {
          console.error('Error loading events from localStorage:', error);
          // Fallback to mock events if there's an error
          setEvents(mockEvents);
        }
      }
    }
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const now = new Date();
      // Use local time instead of UTC
      setCurrentDate(new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      ));
    }
  }, [isClient]);

  const isToday = (date: Date) => {
    if (!isClient) return false;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  };

  const getDaysInMonth = (date: Date) => {
    // Use local time instead of UTC
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Use local time instead of UTC
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekDates = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date.getFullYear(), date.getMonth(), diff + i);
      weekDates.push(newDate);
    }
    return weekDates;
  };

  const prevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleMonthDateClick = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation();
    if (selectedDate || selectedEvent) {
      handleBackgroundClick();
      return;
    }
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const now = new Date();
    const newDate = new Date(date);
    newDate.setHours(now.getHours());
    newDate.setMinutes(Math.floor(now.getMinutes() / 15) * 15);
    
    setSelectedDate(newDate);
    setFormPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
    });
  };

  const handleWeekTimeClick = (e: React.MouseEvent, date: Date, hour: number) => {
    e.stopPropagation();
    if (selectedDate || selectedEvent) {
      handleBackgroundClick();
      return;
    }
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const minutes = Math.floor((clickY / rect.height) * 60);
    const roundedMinutes = Math.floor(minutes / 15) * 15;
    
    const newDate = new Date(date);
    newDate.setHours(hour);
    newDate.setMinutes(roundedMinutes);
    
    setSelectedDate(newDate);
    setFormPosition({
      x: rect.left + rect.width / 2,
      y: e.clientY + window.scrollY
    });
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'uid' | 'created' | 'lastModified'>) => {
    const now = new Date().toISOString();
    
    // Ensure date is in YYYY-MM-DD format
    const formattedDate = eventData.date.split('T')[0];
    
    console.log('Saving event with date:', {
      originalDate: eventData.date,
      formattedDate
    });

    const eventWithFormattedDate = {
      ...eventData,
      date: formattedDate
    };
    
    let updatedEvents: Event[];
    
    if (editingEvent) {
      updatedEvents = events.map(event => 
        event.id === editingEvent.id ? {
          ...eventWithFormattedDate,
          id: event.id,
          uid: event.uid,
          created: event.created,
          lastModified: now,
        } : event
      );
    } else {
      const newEvent = {
        ...eventWithFormattedDate,
        id: events.length + 1,
        uid: `evt-${(events.length + 1).toString().padStart(3, '0')}@example.com`,
        created: now,
        lastModified: now,
      };
      updatedEvents = [...events, newEvent];
      
      console.log('New event created:', newEvent);
    }
    
    setEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    
    setFormPosition(null);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setSelectedEvent(null);
    const date = new Date(event.date);
    setSelectedDate(date);
    setFormPosition({ x: window.innerWidth / 2, y: window.scrollY + 100 });
  };

  const scrollToCurrentTime = () => {
    if (weekViewRef.current && viewMode === 'week') {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const scrollPosition = (hour * 64) + ((minute / 60) * 64) - 100; // 100px offset for better visibility
      weekViewRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  };

  // Scroll to current time when switching to week view or when view mode changes
  useEffect(() => {
    if (viewMode === 'week') {
      scrollToCurrentTime();
    }
  }, [viewMode]);

  const isWeekend = (dayIndex: number) => {
    return dayIndex === 0 || dayIndex === 6;
  };

  const isPastTime = (date: Date, hour: number, minute: number = 0) => {
    if (!isClient) return false;
    const now = new Date();
    const compareDate = new Date(date);
    compareDate.setHours(hour);
    compareDate.setMinutes(minute);
    return compareDate < now;
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-32 bg-gray-50"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          // Use local time instead of UTC
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayEvents = getEventsForDay(date);
          const todayCheck = isToday(date);
          
          return (
            <div
              key={day}
              onClick={(e) => handleMonthDateClick(e, date)}
              className="h-32 border border-gray-100 p-1 hover:bg-gray-50 cursor-pointer relative group"
            >
              <div className="flex flex-col items-start">
                <div className={`font-medium mb-1 ${todayCheck ? 'w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center' : ''}`}>
                  {day}
                </div>
              </div>
              {dayEvents.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(e, event)}
                  className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1 hover:bg-blue-200 cursor-pointer transition-colors"
                >
                  <div className="font-medium">{event.time}～{event.endTime} {event.title}</div>
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">
                  他 {dayEvents.length - 2} 件
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMonthDateClick(e, date);
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                +
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const now = isClient ? new Date() : new Date(0);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimePosition = (currentHour * 64) + ((currentMinute / 60) * 64);

    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const shouldShowEvent = (event: Event, hour: number, dateStr: string) => {
      if (event.date !== dateStr) return false;

      const eventStartMinutes = timeToMinutes(event.time);
      const eventEndMinutes = timeToMinutes(event.endTime);
      const slotStartMinutes = hour * 60;
      const slotEndMinutes = (hour + 1) * 60;

      return eventStartMinutes < slotEndMinutes && eventEndMinutes > slotStartMinutes;
    };

    return (
      <div className="flex h-[calc(100vh-200px)]">
        {/* Time slots column */}
        <div className="w-20 flex-shrink-0 border-r border-gray-200">
          <div className="h-14 bg-white sticky top-0 z-20" />
        </div>

        {/* Days grid */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr] min-w-[780px]">
            {/* Headers row */}
            <div className="sticky top-0 z-20 bg-white col-span-2 grid grid-cols-[80px_1fr]">
              <div />
              <div className="grid grid-cols-7">
                {weekDates.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const todayCheck = isToday(date);
                  const isWeekendDay = isWeekend(index);
                  
                  return (
                    <div
                      key={index}
                      className={`h-14 border-b border-r border-gray-200 p-1 ${
                        !isCurrentMonth ? 'bg-gray-50' : ''
                      } ${isWeekendDay ? 'bg-gray-50' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className={`text-sm ${isWeekendDay ? 'text-gray-500' : ''}`}>
                          {weekDays[index]}
                        </div>
                        <div
                          className={`text-sm font-medium mt-0.5 flex items-center justify-center ${
                            !isCurrentMonth ? 'text-gray-400' : ''
                          } ${
                            todayCheck
                              ? 'w-6 h-6 bg-blue-500 text-white rounded-full'
                              : isWeekendDay ? 'text-gray-500' : ''
                          }`}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scrollable content */}
            <div ref={weekViewRef} className="col-span-2 grid grid-cols-[80px_1fr] overflow-auto" style={{ height: 'calc(100vh - 250px)' }}>
              {/* Time labels column */}
              <div className="bg-white">
                {timeSlots.map(({ hour, label }) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-100 text-xs text-gray-500 pr-2 text-right flex items-center justify-end"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Time grid with current time indicator */}
              <div className="relative">
                {/* Current time indicator */}
                {isToday(weekDates[new Date().getDay()]) && (
                  <div 
                    className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                    style={{ top: `${currentTimePosition}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                    <div className="flex-1 border-t border-red-500"></div>
                  </div>
                )}

                <div className="grid grid-cols-7">
                  {timeSlots.map(({ hour }) => (
                    <React.Fragment key={hour}>
                      {weekDates.map((date, dayIndex) => {
                        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                        const hourEvents = events.filter(event => shouldShowEvent(event, hour, dateStr));
                        const isWeekendDay = isWeekend(dayIndex);
                        const isPast = isPastTime(date, hour);

                        return (
                          <div
                            key={`${hour}-${dayIndex}`}
                            className={`h-16 border-b border-r border-gray-100 relative group
                              ${isWeekendDay ? 'bg-gray-50' : ''}
                              ${isPast ? 'bg-gray-50/50' : ''}
                            `}
                            onClick={(e) => handleWeekTimeClick(e, date, hour)}
                          >
                            {hourEvents.map(event => {
                              const eventStartMinutes = timeToMinutes(event.time);
                              const eventEndMinutes = timeToMinutes(event.endTime);
                              const slotStartMinutes = hour * 60;
                              
                              const top = Math.max(0, eventStartMinutes - slotStartMinutes);
                              const duration = eventEndMinutes - eventStartMinutes;
                              const height = Math.min(60, duration) * (64 / 60);

                              return (
                                <div
                                  key={event.id}
                                  onClick={(e) => handleEventClick(e, event)}
                                  className="absolute left-0 right-0 mx-1 rounded px-1 py-0.5 bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors overflow-hidden text-xs"
                                  style={{
                                    top: `${(top * 64) / 60}px`,
                                    height: `${height}px`,
                                    zIndex: 10,
                                  }}
                                >
                                  <div className="font-medium truncate">
                                    {event.time}～{event.endTime} {event.title}
                                  </div>
                                </div>
                              );
                            })}

                            {!isPast && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWeekTimeClick(e, date, hour);
                                }}
                                className="absolute top-0 right-0 m-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                +
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleBackgroundClick = () => {
    setSelectedEvent(null);
    setFormPosition(null);
    setSelectedDate(null);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventToDelete: Event) => {
    const updatedEvents = events.filter(event => event.id !== eventToDelete.id);
    setEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    setSelectedEvent(null);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-6"
      onClick={handleBackgroundClick}
    >
      <div 
        className="flex justify-between items-center mb-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
            {viewMode === 'week' && ` 第${Math.ceil(currentDate.getDate() / 7)}週`}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              週
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevPeriod}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            {viewMode === 'month' ? '前月' : '前週'}
          </button>
          <button
            onClick={nextPeriod}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            {viewMode === 'month' ? '次月' : '次週'}
          </button>
        </div>
      </div>

      <div>
        <ClientOnly>
          {viewMode === 'month' ? renderMonthView() : renderWeekView()}
        </ClientOnly>
      </div>

      {selectedDate && (
        <div onClick={e => e.stopPropagation()}>
          <EventForm
            selectedDate={selectedDate}
            onSave={handleSaveEvent}
            onClose={handleBackgroundClick}
            position={formPosition}
            editingEvent={editingEvent}
          />
        </div>
      )}

      {selectedEvent && (
        <div onClick={e => e.stopPropagation()}>
          <EventDetail
            event={selectedEvent}
            onClose={handleBackgroundClick}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar; 