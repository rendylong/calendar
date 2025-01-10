'use client';

import Calendar from '@/components/Calendar';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">スケジュール管理</h1>
        <Calendar />
      </div>
    </main>
  );
}
