'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

/**
 * Тестовая страница для проверки Realtime
 * 
 * Открой: http://localhost:3000/test-realtime
 * 
 * Эта страница покажет:
 * - Статус подключения
 * - Все приходящие события
 * - Логи в UI (не только в консоли)
 */

interface RealtimeEvent {
  time: string;
  event: string;
  data: any;
}

export default function TestRealtimePage() {
  const [status, setStatus] = useState<string>('Connecting...');
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    console.log('🚀 [TestRealtime] Initializing...');

    // Создать Supabase клиент
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('🔧 [TestRealtime] Supabase client created:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });

    // Подписаться на transaction_log БЕЗ ФИЛЬТРА (для теста)
    const channel = supabase
      .channel('test_realtime_all')
      .on(
        'postgres_changes',
        {
          event: '*', // Все события: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transaction_log',
          // Фильтра НЕТ - получим ВСЕ события
        },
        (payload) => {
          console.log('🎉🎉🎉 [TestRealtime] EVENT RECEIVED!', payload);
          
          const newEvent: RealtimeEvent = {
            time: new Date().toLocaleTimeString(),
            event: payload.eventType,
            data: payload.new || payload.old
          };

          setEvents(prev => [newEvent, ...prev]);
        }
      )
      .subscribe((status, err) => {
        console.log('📡 [TestRealtime] Subscription status:', status);
        
        if (err) {
          console.error('❌ [TestRealtime] Subscription error:', err);
        }

        setStatus(status);

        if (status === 'SUBSCRIBED') {
          console.log('✅ [TestRealtime] Successfully subscribed!');
          setIsSubscribed(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [TestRealtime] Channel error');
          setIsSubscribed(false);
        }
      });

    // Cleanup
    return () => {
      console.log('🧹 [TestRealtime] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          🔄 Realtime Test Page
        </h1>
        <p className="text-gray-400 mb-8">
          Проверка работы Supabase Realtime без фильтров
        </p>

        {/* Status */}
        <div className={`rounded-lg p-6 mb-6 border-2 ${
          isSubscribed 
            ? 'bg-green-900/20 border-green-500'
            : status === 'CHANNEL_ERROR'
            ? 'bg-red-900/20 border-red-500'
            : 'bg-yellow-900/20 border-yellow-500'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-4 h-4 rounded-full ${
              isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`}></div>
            <h2 className="text-xl font-bold text-white">
              Статус подключения
            </h2>
          </div>
          <p className="text-lg">
            {isSubscribed 
              ? '✅ Подключено к Realtime!' 
              : status === 'CHANNEL_ERROR'
              ? '❌ Ошибка подключения'
              : `🔄 ${status}...`}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6 mb-6">
          <h3 className="text-blue-400 font-semibold mb-3">🧪 Как протестировать:</h3>
          <ol className="text-blue-300 space-y-2 ml-4 list-decimal">
            <li>Открой <strong>Supabase Dashboard</strong></li>
            <li>Перейди в <strong>Table Editor</strong> → <code className="bg-blue-950 px-1 rounded">transaction_log</code></li>
            <li>Нажми <strong>Insert row</strong></li>
            <li>Заполни любые данные и нажми <strong>Save</strong></li>
            <li>Транзакция должна появиться ЗДЕСЬ в реальном времени! ⚡</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-950/50 rounded">
            <p className="text-blue-200 text-sm">
              💡 <strong>Важно:</strong> Эта страница слушает <strong>ВСЕ</strong> транзакции (без фильтра).
              Если события не приходят - проблема в Supabase Realtime настройках.
            </p>
          </div>
        </div>

        {/* Events */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              📨 Полученные события: {events.length}
            </h2>
            {events.length > 0 && (
              <button
                onClick={() => setEvents([])}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
              >
                Очистить
              </button>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-lg">Ожидаю события...</p>
              <p className="text-sm mt-2">Создай транзакцию в Supabase Dashboard!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 animate-[fadeIn_0.3s_ease-in]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {event.event === 'INSERT' ? '➕' : event.event === 'UPDATE' ? '✏️' : '🗑️'}
                    </span>
                    <span className="font-semibold text-white">
                      {event.event}
                    </span>
                    <span className="text-gray-500 text-sm ml-auto">
                      {event.time}
                    </span>
                  </div>
                  <pre className="bg-gray-950 p-3 rounded text-xs text-green-400 overflow-x-auto">
{JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Console hint */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          💡 Также смотри логи в <strong>Console</strong> браузера (F12)
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
















