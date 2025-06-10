import { useState, useMemo, useCallback } from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { useHabits, useHabitHistory } from '@/lib/hooks/use-habits';
import { CalendarView } from '@/components/CalendarView';
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingLottie } from '@/components/ui';
import { LOTTIE_ANIMATIONS } from '@/constants/lottie-animations';

const CalendarPage = () => {
  const { data: habits } = useHabits();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const queryClient = useQueryClient();

  const { startDate, endDate } = useMemo(() => {
    const start = startOfMonth(subMonths(currentViewDate, 1));
    const end = endOfMonth(addMonths(currentViewDate, 1));

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    };
  }, [currentViewDate]);

  const { data: historyData, isLoading, error } = useHabitHistory(startDate, endDate);

  const prefetchAdjacentMonths = useCallback((newMonth) => {
    const futureStart = format(startOfMonth(addMonths(newMonth, 2)), 'yyyy-MM-dd');
    const futureEnd = format(endOfMonth(addMonths(newMonth, 4)), 'yyyy-MM-dd');

    const pastStart = format(startOfMonth(subMonths(newMonth, 4)), 'yyyy-MM-dd');
    const pastEnd = format(endOfMonth(subMonths(newMonth, 2)), 'yyyy-MM-dd');

    queryClient.prefetchQuery({
      queryKey: ['habits', 'history', futureStart, futureEnd],
      queryFn: () => api.habits.getHistory(futureStart, futureEnd),
      staleTime: 30 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: ['habits', 'history', pastStart, pastEnd],
      queryFn: () => api.habits.getHistory(pastStart, pastEnd),
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient]);

  const handleMonthChange = useCallback((newMonth) => {
    setCurrentViewDate(newMonth);
    prefetchAdjacentMonths(newMonth);
  }, [prefetchAdjacentMonths]);

  const getHabitCompletionForDate = useCallback((habitId, date) => {
    if (!historyData?.dailySummaries) return false;

    const dayData = historyData.dailySummaries.find(day => day.date === date);
    if (!dayData) return false;

    const habitData = dayData.habits.find(h => h.id === habitId);
    return habitData?.completed || false;
  }, [historyData]);

  if (isLoading || !habits) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="mobile-container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center space-y-2">
          <LoadingLottie
            className="w-80 h-80"
            src={LOTTIE_ANIMATIONS.calendarLoading}
            message="Setting up your streak timeline"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <MobileLayout>
          <div className="mobile-container pt-32">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load calendar data</p>
              <button
                onClick={() => window.location.reload()}
                className="text-pink-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </MobileLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <MobileLayout>
        <div className="mobile-container pb-32">
          <div className="px-4">
            <header className="pt-8 pb-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your Journey 📅</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  See how beautifully your habits are growing over time
                </p>
              </div>
            </header>

            <div className="bg-white/60 dark:bg-white/5 rounded-3xl p-6 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CalendarView
                habits={habits}
                onSelectDate={setSelectedDate}
                getHabitCompletionForDate={getHabitCompletionForDate}
                selectedDate={selectedDate}
                currentDate={currentViewDate}
                onMonthChange={handleMonthChange}
              />
            </div>
          </div>
        </div>
      </MobileLayout>
    </div>
  );
};

export default CalendarPage;
