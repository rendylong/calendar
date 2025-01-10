'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDefaultStartTime, getDefaultEndTime } from '@/utils/timeUtils';

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
  editingEvent: Event | null;
  initialTime?: string;
}

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  return {
    value: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  };
});

export default function EventForm({
  selectedDate,
  onSave,
  onClose,
  editingEvent,
  initialTime
}: EventFormProps) {
  const defaultStartTime = initialTime || getDefaultStartTime();
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
      user: '山田太郎',
      guests,
      status,
      category,
      priority,
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

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingEvent ? '予定を編集' : '新しい予定'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">開始 <span className="text-red-500">*</span></Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue>{time}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">終了 <span className="text-red-500">*</span></Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue>{endTime}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">場所</Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="会議室、オンラインなど"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>参加者</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={guestInput}
                onChange={e => setGuestInput(e.target.value)}
                placeholder="メールアドレス"
              />
              <Button type="button" onClick={addGuest} variant="secondary">
                追加
              </Button>
            </div>
            {guests.length > 0 && (
              <div className="space-y-1 mt-2">
                {guests.map(guest => (
                  <div key={guest} className="flex items-center justify-between bg-muted px-3 py-2 rounded-md">
                    <span className="text-sm">{guest}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGuest(guest)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 