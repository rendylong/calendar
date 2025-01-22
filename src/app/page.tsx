'use client';

import { useState } from 'react';
import Image from 'next/image';
import Calendar from '@/components/Calendar';
import ChatbotWidget from '@/components/ChatbotWidget';
import Link from 'next/link';

type ViewMode = 'month' | 'week';
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// Mock user data
const currentUser = {
  name: 'システム',
  email: 'system@example.com',
  avatar: '/images/default-avatar.svg'
};

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  return (
    <main className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">スケジュール管理</h1>
          <div className="flex bg-gray-100 p-0.5 rounded-md">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              月
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              週
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium">
              {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
              {viewMode === 'week' && ` 第${Math.ceil(currentDate.getDate() / 7)}週`}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevPeriod}
                className="px-3 py-1.5 bg-white border rounded-md text-sm hover:bg-gray-50 flex items-center gap-1 text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {viewMode === 'month' ? '前月' : '前週'}
              </button>
              <button
                onClick={nextPeriod}
                className="px-3 py-1.5 bg-white border rounded-md text-sm hover:bg-gray-50 flex items-center gap-1 text-gray-600"
              >
                {viewMode === 'month' ? '次月' : '次週'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200" />
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{currentUser.email}</div>
            </div>
            <div className="relative w-8 h-8">
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                fill
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
      <Calendar 
        viewMode={viewMode}
        currentDate={currentDate}
        currentUser={currentUser}
      />
      <ChatbotWidget />
      <Link
        href="/assistant"
        className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
      >
        AI アシスタント
      </Link>
    </main>
  );
}
