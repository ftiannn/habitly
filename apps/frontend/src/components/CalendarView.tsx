import { useMemo } from 'react';
import { Habit } from '@/types/habit.types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  subMonths,
  addMonths,
  isToday,
  isFuture
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon } from 'lucide-react';
import { getDateCompletionStatus, getHabitsActiveOnDate } from '@/lib/utils/habit-utils';

interface CalendarViewProps {
  habits: Habit[];
  onSelectDate: (date: Date) => void;
  getHabitCompletionForDate: (habitId: number, date: string) => boolean;
  selectedDate: Date;
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export const CalendarView = ({
  habits,
  onSelectDate,
  getHabitCompletionForDate,
  selectedDate,
  currentDate,
  onMonthChange
}: CalendarViewProps) => {
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
  }, [currentDate]);

  const habitCountsByDate = useMemo(() => {
    const counts = {};
    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const activeHabits = getHabitsActiveOnDate(habits, day);
      const completed = activeHabits.filter(h => getHabitCompletionForDate(h.id, dateStr));
      counts[dateStr] = { total: activeHabits.length, completed: completed.length };
    });
    return counts;
  }, [daysInMonth, habits, getHabitCompletionForDate]);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const activeHabitsForSelectedDate = getHabitsActiveOnDate(habits, selectedDate);
  const isSelectedDateFuture = isFuture(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between w-full">
        <button onClick={() => onMonthChange(subMonths(currentDate, 1))} className="w-10 h-10 rounded-xl bg-white/70 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200">
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={() => onMonthChange(addMonths(currentDate, 1))} className="w-10 h-10 rounded-xl bg-white/70 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-4">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-semibold py-3 text-gray-600 dark:text-gray-400 uppercase tracking-wide">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {daysInMonth.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const counts = habitCountsByDate[dayStr] || { total: 0, completed: 0 };
          const status = getDateCompletionStatus(habits, day, getHabitCompletionForDate);

          return (
            <button
              key={day.toString()}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-300 m-0.5
                ${isSelected ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-xl scale-110 z-10'
                  : counts.total > 0
                    ? 'bg-white/90 dark:bg-slate-700 text-gray-700 dark:text-gray-200 shadow-md border border-white/50 dark:border-slate-600'
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500'}
                ${isCurrentDay && !isSelected ? 'ring-2 ring-pink-400 dark:ring-pink-500 ring-offset-2 ring-offset-white/50 dark:ring-offset-slate-800' : ''}`}
              onClick={() => onSelectDate(day)}
            >
              <span className={isSelected ? 'font-bold' : ''}>{format(day, 'd')}</span>
              {counts.total > 0 && !isSelected && (
                <div
                  className={`
                    absolute bottom-[2px] w-1 h-1 rounded-full
                    ${status === 'all' ? 'bg-green-500/80' :
                      status === 'partial' ? 'bg-orange-400/80' :
                        'bg-gray-400 dark:bg-gray-500/80'}
                  `}
                />
              )}


            </button>
          );
        })}
      </div>

      <div className="bg-white/90 dark:bg-slate-800 rounded-2xl p-5 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center mb-5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-600 flex items-center justify-center mr-3">
            <CalendarIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h4>
        </div>

        {activeHabitsForSelectedDate.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-3">🌙</div>
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-2">A peaceful day</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">No habits scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeHabitsForSelectedDate.map(habit => {
              const isCompleted = getHabitCompletionForDate(habit.id, dateStr);
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-gray-100 dark:bg-slate-600">
                    {isCompleted ? (
                      <Check size={18} className="text-purple-500 dark:text-purple-300" />
                    ) : (
                      <span className="text-xl text-gray-700 dark:text-white">{habit.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {habit.name}
                    </h4>
                    {habit.description && (
                      <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">{habit.description}</p>
                    )}
                  </div>
                  {habit.notificationTime && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/30 text-purple-600 dark:text-purple-200">
                      {habit.notificationTime}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};