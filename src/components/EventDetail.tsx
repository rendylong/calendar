'use client';

import React from 'react';

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

const statusLabels: Record<Event['status'], string> = {
  CONFIRMED: '確定',
  TENTATIVE: '仮',
  CANCELLED: 'キャンセル'
};

const priorityLabels: Record<number, string> = {
  1: '高',
  2: '中',
  3: '低'
};

interface EventDetailProps {
  event: Event;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export default function EventDetail({ event, onClose, onEdit, onDelete }: EventDetailProps) {
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        style={{ zIndex: 9998 }}
      />
      
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-96 max-h-[90vh] overflow-auto"
        style={{ zIndex: 9999 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {event.priority && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                  優先度: {priorityLabels[event.priority]}
                </span>
              )}
              {event.category && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {event.category}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                {statusLabels[event.status]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="text-sm">
            <span className="text-gray-500">日時：</span>
            <span className="font-medium">{event.date} {event.time}～{event.endTime}</span>
          </div>
          
          {event.location && (
            <div className="text-sm">
              <span className="text-gray-500">場所：</span>
              <span className="font-medium">{event.location}</span>
            </div>
          )}
          
          {event.description && (
            <div className="text-sm">
              <span className="text-gray-500">説明：</span>
              <div className="mt-1 text-gray-700 whitespace-pre-wrap">{event.description}</div>
            </div>
          )}
          
          <div className="text-sm">
            <span className="text-gray-500">担当者：</span>
            <span className="font-medium">{event.user}</span>
          </div>
          
          {event.guests && event.guests.length > 0 && (
            <div className="text-sm">
              <span className="text-gray-500">参加者：</span>
              <div className="mt-1 space-y-1">
                {event.guests.map((guest, index) => (
                  <div key={index} className="text-gray-700">{guest}</div>
                ))}
              </div>
            </div>
          )}

          {event.recurrence && (
            <div className="text-sm">
              <span className="text-gray-500">繰り返し：</span>
              <div className="mt-1 text-gray-700">
                {event.recurrence.frequency === 'DAILY' && '毎日'}
                {event.recurrence.frequency === 'WEEKLY' && '毎週'}
                {event.recurrence.frequency === 'MONTHLY' && '毎月'}
                {event.recurrence.frequency === 'YEARLY' && '毎年'}
                {event.recurrence.interval && ` (${event.recurrence.interval}回ごと)`}
                {event.recurrence.count && ` ${event.recurrence.count}回`}
                {event.recurrence.until && ` ${event.recurrence.until}まで`}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 border-t pt-2 mt-2">
            作成日時：{new Date(event.created).toLocaleString('ja-JP')}
            <br />
            最終更新：{new Date(event.lastModified).toLocaleString('ja-JP')}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              if (window.confirm('このイベントを削除してもよろしいですか？')) {
                onDelete(event);
              }
            }}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            削除
          </button>
          <button
            onClick={() => onEdit(event)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            編集
          </button>
        </div>
      </div>
    </>
  );
} 