'use client';

import { useState } from 'react';
import Image from 'next/image';
import Calendar from '@/components/Calendar';

type ViewMode = 'month' | 'week';
const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// Mock user data
const currentUser = {
  name: '山田太郎',
  email: 'yamada.taro@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada'
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
    <main className="min-h-screen p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-medium">スケジュール管理</h1>
            <div className="flex items-center gap-4">
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
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium">
                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                {viewMode === 'week' && ` 第${Math.ceil(currentDate.getDate() / 7)}週`}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={prevPeriod}
                  className="px-2 py-0.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
                >
                  {viewMode === 'month' ? '前月' : '前週'}
                </button>
                <button
                  onClick={nextPeriod}
                  className="px-2 py-0.5 bg-gray-100 rounded text-sm hover:bg-gray-200"
                >
                  {viewMode === 'month' ? '次月' : '次週'}
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
      </div>
    </main>
  );
}
