'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

type ViewMode = 'month' | 'week';

const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

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

interface CalendarProps {
  viewMode: ViewMode;
  currentDate: Date;
  currentUser: {
    name: string;
    email: string;
    avatar: string;
  };
}

const Calendar = ({ viewMode, currentDate, currentUser }: CalendarProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const weekViewRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [initialTime, setInitialTime] = useState<string | undefined>();

  // Load events from localStorage on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        try {
          const parsedEvents = JSON.parse(savedEvents);
          setEvents(parsedEvents);
        } catch (error) {
          console.error('Error loading events from localStorage:', error);
          setEvents([]);
        }
      }
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
    
    const now = new Date();
    const newDate = new Date(date);
    const hour = now.getHours();
    const minutes = Math.floor(now.getMinutes() / 15) * 15;
    newDate.setHours(hour);
    newDate.setMinutes(minutes);
    
    // Format the time string
    const timeString = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    setSelectedDate(newDate);
    setInitialTime(timeString);
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
    
    // Format the time string
    const timeString = `${String(hour).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
    
    setSelectedDate(newDate);
    setInitialTime(timeString);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'uid' | 'created' | 'lastModified'>) => {
    const now = new Date().toISOString();
    
    // Ensure date is in YYYY-MM-DD format
    const formattedDate = eventData.date.split('T')[0];

    const eventWithFormattedDate = {
      ...eventData,
      date: formattedDate,
      user: currentUser.name, // Use the currentUser prop
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
    }
    
    setEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    
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
  };

  const scrollToCurrentTime = useCallback(() => {
    if (weekViewRef.current && viewMode === 'week') {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const scrollPosition = (hour * 64) + ((minute / 60) * 64) - 100; // 100px offset for better visibility
      weekViewRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [viewMode]);

  // Scroll to current time when switching to week view or when view mode changes
  useEffect(() => {
    if (viewMode === 'week') {
      scrollToCurrentTime();
    }
  }, [viewMode, scrollToCurrentTime]);

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

  const EventCard = ({ event, onClick, colorClass = 'bg-blue-100 text-blue-800 hover:bg-blue-200' }: { 
    event: Event; 
    onClick: (e: React.MouseEvent) => void;
    colorClass?: string;
  }) => {
    return (
      <div
        onClick={onClick}
        className={`text-xs rounded px-1 py-0.5 mb-1 cursor-pointer transition-colors relative ${colorClass}`}
      >
        <div className="font-medium truncate">
          {event.time}～{event.endTime} {event.title}
        </div>
      </div>
    );
  };

  const WeekEventCard = ({ 
    event, 
    onClick, 
    style, 
    colorClass 
  }: { 
    event: Event; 
    onClick: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
    colorClass: string;
  }) => {    
    return (
      <div
        onClick={onClick}
        className={`absolute mx-1 rounded px-1 py-0.5 cursor-pointer transition-colors overflow-visible text-xs ${colorClass}`}
        style={style}
      >
        <div className="font-medium truncate">
          {event.time}～{event.endTime} {event.title}
        </div>
        <div className="truncate text-xs opacity-75">
          {event.location}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);

    return (
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2 text-sm font-medium border-r border-gray-200">
            {day}
          </div>
        ))}
        
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-[120px] bg-gray-50 border-r border-b border-gray-200"></div>
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayEvents = getEventsForDay(date);
          const todayCheck = isToday(date);
          
          return (
            <div
              key={day}
              onClick={(e) => handleMonthDateClick(e, date)}
              className="h-[120px] border-r border-b border-gray-200 p-1 hover:bg-gray-50/50 cursor-pointer relative group"
            >
              <div className="flex flex-col items-start">
                <div className={`text-sm font-medium mb-1 ${todayCheck ? 'w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center' : ''}`}>
                  {day}
                </div>
              </div>
              {dayEvents.slice(0, 3).map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={(e) => handleEventClick(e, event)}
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500">
                  他 {dayEvents.length - 3} 件
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

    const eventColors = [
      'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'bg-green-100 text-green-800 hover:bg-green-200',
      'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'bg-pink-100 text-pink-800 hover:bg-pink-200'
    ];

    const getOverlappingEvents = (events: Event[]) => {
      const overlaps = new Map<number, number>();
      const positions = new Map<number, number>();
      
      events.forEach((event, index) => {
        const startMinutes = timeToMinutes(event.time);
        const endMinutes = timeToMinutes(event.endTime);
        let overlapCount = 0;
        let maxPosition = -1;
        
        events.forEach((otherEvent, otherIndex) => {
          if (index !== otherIndex) {
            const otherStartMinutes = timeToMinutes(otherEvent.time);
            const otherEndMinutes = timeToMinutes(otherEvent.endTime);
            
            if (!(endMinutes <= otherStartMinutes || startMinutes >= otherEndMinutes)) {
              overlapCount++;
              if (positions.has(otherEvent.id)) {
                maxPosition = Math.max(maxPosition, positions.get(otherEvent.id)!);
              }
            }
          }
        });
        
        overlaps.set(event.id, overlapCount);
        positions.set(event.id, maxPosition + 1);
      });
      
      return { overlaps, positions };
    };

    const shouldShowEvent = (event: Event, hour: number, dateStr: string) => {
      if (event.date !== dateStr) return false;

      const eventStartMinutes = timeToMinutes(event.time);
      const eventStartHour = Math.floor(eventStartMinutes / 60);
      return eventStartHour === hour;
    };

    return (
      <div className="flex h-full -ml-[80px]">
        {/* Time slots column */}
        <div className="w-20 flex-shrink-0">
          <div className="h-14 bg-white sticky top-0 z-20" />
        </div>

        {/* Days grid */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr] min-w-[780px]">
            {/* Headers row */}
            <div className="sticky top-0 z-20 bg-white col-span-2 grid grid-cols-[80px_1fr]">
              <div />
              <div className="grid grid-cols-7 border-t border-l border-gray-200">
                {weekDates.map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const todayCheck = isToday(date);
                  const isWeekendDay = isWeekend(index);
                  
                  return (
                    <div
                      key={index}
                      className={`h-14 border-r border-b border-gray-200 p-1 ${
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
            <div ref={weekViewRef} className="col-span-2 grid grid-cols-[80px_1fr] overflow-auto" style={{ height: 'calc(100vh - 180px)' }}>
              {/* Time labels column */}
              <div className="bg-white">
                {timeSlots.map(({ hour: slotHour, label }) => (
                  <div
                    key={slotHour}
                    className="h-16 text-xs text-gray-500 pr-2 text-right flex items-center justify-end"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Time grid with current time indicator */}
              <div className="relative border-l border-gray-200">
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
                        const { overlaps, positions } = getOverlappingEvents(hourEvents);
                        const isWeekendDay = isWeekend(dayIndex);
                        const isPast = isPastTime(date, hour);
                        const isLastHour = hour === 23;

                        return (
                          <div
                            key={`${hour}-${dayIndex}`}
                            className={`h-16 border-r ${!isLastHour ? 'border-b' : ''} border-gray-200 relative group
                              ${isWeekendDay ? 'bg-gray-50' : ''}
                              ${isPast ? 'bg-gray-50/50' : ''}
                            `}
                            onClick={(e) => handleWeekTimeClick(e, date, hour)}
                          >
                            {hourEvents.map((event, index) => {
                              const eventStartMinutes = timeToMinutes(event.time);
                              const eventEndMinutes = timeToMinutes(event.endTime);
                              const slotStartMinutes = hour * 60;
                              
                              const top = Math.max(0, eventStartMinutes - slotStartMinutes);
                              const duration = eventEndMinutes - eventStartMinutes;
                              const height = Math.min(60, duration) * (64 / 60);
                              
                              const overlapCount = overlaps.get(event.id) || 0;
                              const position = positions.get(event.id) || 0;
                              const width = overlapCount > 0 ? `calc((100% - 8px) / ${overlapCount + 1})` : 'calc(100% - 8px)';
                              const left = position * (100 / (overlapCount + 1));
                              const colorIndex = index % eventColors.length;

                              return (
                                <WeekEventCard
                                  key={event.id}
                                  event={event}
                                  onClick={(e) => handleEventClick(e, event)}
                                  style={{
                                    top: `${(top * 64) / 60}px`,
                                    height: `${height}px`,
                                    width,
                                    left: `calc(${left}% + 4px)`,
                                    zIndex: 10 + position,
                                  }}
                                  colorClass={eventColors[colorIndex]}
                                />
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
    setSelectedDate(null);
    setEditingEvent(null);
    setInitialTime(undefined);
  };

  const handleDeleteEvent = (eventToDelete: Event) => {
    const updatedEvents = events.filter(event => event.id !== eventToDelete.id);
    setEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    setSelectedEvent(null);
  };

  return (
    <div 
      className="w-full"
      onClick={handleBackgroundClick}
    >
      <div className="relative h-[calc(100vh-80px)] overflow-hidden">
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
            editingEvent={editingEvent}
            initialTime={initialTime}
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