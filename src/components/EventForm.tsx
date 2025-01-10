'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getLocalTime, roundToNearestQuarter, formatTime, getDefaultStartTime, getDefaultEndTime } from '@/utils/timeUtils';

interface Event {
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
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    until?: string;
    count?: number;
    byDay?: string[];
  };
  created: string;
  lastModified: string;
  timezone?: string;
}

interface EventFormProps {
  selectedDate: Date;
  onSave: (event: Omit<Event, 'id' | 'uid' | 'created' | 'lastModified'>) => void;
  onClose: () => void;
  position: { x: number; y: number } | null;
  editingEvent: Event | null;
}

const categories = [
  'MEETING',
  'TRAINING',
  'REVIEW',
  'PERSONAL',
  'OTHER'
];

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const date = new Date();
  date.setHours(Math.floor(i / 4), (i % 4) * 15, 0, 0);
  const value = formatTime(date);
  return {
    value,
    label: value
  };
});

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function TimeSelect({ value, onChange, className = '' }: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to selected time when dropdown opens
  useEffect(() => {
    if (isOpen && optionsRef.current) {
      const selectedOption = optionsRef.current.querySelector(`[data-value="${value}"]`);
      if (selectedOption) {
        selectedOption.scrollIntoView({ block: 'center' });
      }
    }
  }, [isOpen, value]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border rounded-md bg-white flex items-center justify-between"
      >
        <span>{value}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          ref={optionsRef}
          className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {timeOptions.map(option => (
            <button
              key={option.value}
              data-value={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                value === option.value ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EventForm({
  selectedDate,
  onSave,
  onClose,
  position,
  editingEvent
}: EventFormProps) {
  const defaultStartTime = getDefaultStartTime();
  const defaultEndTime = getDefaultEndTime(defaultStartTime);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState<string[]>([]);
  const [status, setStatus] = useState<'CONFIRMED' | 'TENTATIVE' | 'CANCELLED'>('CONFIRMED');
  const [category, setCategory] = useState('MEETING');
  const [priority, setPriority] = useState(2);
  const [recurrence, setRecurrence] = useState<Event['recurrence']>();
  const [guestInput, setGuestInput] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setDescription(editingEvent.description || '');
      setTime(editingEvent.time);
      setEndTime(editingEvent.endTime);
      setLocation(editingEvent.location || '');
      setGuests(editingEvent.guests || []);
      setStatus(editingEvent.status);
      setCategory(editingEvent.category || 'MEETING');
      setPriority(editingEvent.priority || 2);
      setRecurrence(editingEvent.recurrence);
    }
  }, [editingEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = selectedDate.toISOString().split('T')[0];
    
    onSave({
      title,
      date,
      time,
      endTime,
      description,
      location,
      user: '山田太郎', // Current user
      guests,
      status,
      category,
      priority,
      recurrence,
      timezone: 'Asia/Tokyo'
    });
  };

  const addGuest = () => {
    if (guestInput && !guests.includes(guestInput)) {
      setGuests([...guests, guestInput]);
      setGuestInput('');
    }
  };

  const removeGuest = (guest: string) => {
    setGuests(guests.filter(g => g !== guest));
  };

  const formStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    maxHeight: '90vh',
    maxWidth: 'calc(100vw - 40px)',
    overflow: 'auto'
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        style={{ zIndex: 9998 }}
      />
      <form
        className="bg-white rounded-lg shadow-xl p-6 w-96"
        style={formStyle}
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始 <span className="text-red-500">*</span>
              </label>
              <TimeSelect
                value={time}
                onChange={setTime}
                className="w-full"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了 <span className="text-red-500">*</span>
              </label>
              <TimeSelect
                value={endTime}
                onChange={setEndTime}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              参加者
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={guestInput}
                onChange={e => setGuestInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="メールアドレス"
              />
              <button
                type="button"
                onClick={addGuest}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                追加
              </button>
            </div>
            {guests.length > 0 && (
              <div className="space-y-1">
                {guests.map(guest => (
                  <div key={guest} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm">{guest}</span>
                    <button
                      type="button"
                      onClick={() => removeGuest(guest)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              場所
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="会議室、オンラインなど"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </form>
    </>
  );
} 