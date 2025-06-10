
import React from 'react';
import { Link } from 'react-router-dom';
import { Habit } from '@/types/habit.types';
import { Check, Edit, Clock, Calendar, PauseCircle, Flag } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { WEEKDAY, DAY_LABEL } from '@/constants/habit-constants';
import { getCategoryColor, isHabitPaused } from '@/lib/utils/habit-utils';
import { Card, Button } from '@/components/ui'

interface HabitsListProps {
  habits: Habit[];
  loading: boolean;
  viewType: 'today' | 'all';
  onToggleCompletion?: (habitId: number) => void;
}

export const HabitsList: React.FC<HabitsListProps> = ({
  habits,
  loading,
  viewType,
  onToggleCompletion,
}) => {
  const today = new Date();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Card
            key={index}
            className="relative rounded-xl border bg-rose-50 p-4 shadow-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-rose-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded bg-rose-200 animate-pulse" />
                  <div className="h-2 w-16 rounded bg-rose-100 animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-rose-300 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const handleToggleCompletion = (habitId: number) => {
    if (onToggleCompletion) {
      onToggleCompletion(habitId);
    }
  };

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const todayRecord = habit.completions?.find(record => isSameDay(record.completedAt, today));
        const isCompleted = !!todayRecord?.completedAt;

        const displayTime = habit.notificationTime
          ? format(new Date(`2000-01-01T${habit.notificationTime}`), 'h:mm a')
          : null;

        const isPaused = isHabitPaused(habit);

        const cardStyles = cn(
          "p-4 transition-all duration-300 hover:shadow-md",
          isCompleted && viewType === 'today' ? "bg-primary/5 border-primary/30" : "",
          isPaused && viewType === 'all' ? "bg-gray-100/50 dark:bg-gray-800/50 opacity-75" : ""
        );

        const isStreakIncreased = isCompleted && habit.currentStreak > 0;

        return (
          <Card
            key={habit.category+habit.id}
            className={cardStyles}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className={`icon-circle icon-circle-${getCategoryColor(habit.category)} mr-3 flex-shrink-0`}>
                    {habit.icon}
                  </div>
                  {isPaused && (
                    <PauseCircle size={16} className="absolute -top-1 -right-1 text-amber-500 dark:text-amber-400 bg-white dark:bg-gray-800 rounded-full" />
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium mb-0.5">{habit.name}</h3>
                  </div>

                  {habit.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {habit.description}
                    </p>
                  )}


                  {/* Notification time */}
                  {displayTime && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{displayTime}</span>
                    </div>
                  )}

                  {/* Streak Count in Today view */}
                  {viewType === 'today' && (
                    <div className="mt-1">
                      {habit.currentStreak > 0 ? (
                        <span className={cn(
                          "inline-flex items-center text-xs px-2 py-0.5 rounded-full relative",
                          isCompleted
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
                          isStreakIncreased && "animate-pulse"
                        )}>
                          <span className={cn(
                            "mr-1",
                            isStreakIncreased && "animate-bounce"
                          )}>🔥</span>

                          <span className={cn(
                            "font-medium",
                            isStreakIncreased && "relative"
                          )}>
                            {habit.currentStreak} day streak
                            {isStreakIncreased && (
                              <span className="absolute -top-2 -right-2 text-orange-500 text-[10px] font-bold">+1</span>
                            )}
                          </span>

                          {/* Add subtle glow effect when streak is rising */}
                          {isStreakIncreased && (
                            <span className="absolute inset-0 rounded-full bg-orange-400/20 blur-sm -z-10"></span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Start your streak today!
                        </span>
                      )}
                    </div>
                  )}

                  {/* Frequency information in All Habits View */}
                  {viewType === 'all' && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        {getFrequencyText(habit)}
                      </span>

                      {/* Pause status indicator */}
                      {isPaused && (
                        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
                          <PauseCircle className="h-3 w-3 mr-1" />
                          Paused until {format(new Date(habit.pauseUntil!), "MMM d")}
                        </span>
                      )}

                      {/* End date indicator */}
                      {habit.endAt && (
                        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          <Flag className="h-3 w-3 mr-1" />
                          Ends {format(new Date(habit.endAt), "MMM d")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link to={`/edit-habit/${habit.id}`}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Completion button in Today's view */}
                {viewType === 'today' && onToggleCompletion && (
                  <Button
                    size="icon"
                    variant={isCompleted ? "default" : "outline"}
                    className={`h-9 w-9 rounded-full ${isCompleted ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => handleToggleCompletion(habit.id)}
                  >
                    <Check className={`h-5 w-5 ${isCompleted ? "text-white" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Helper function to generate human-readable frequency text
function getFrequencyText(habit: Habit): string {
  if (habit.frequency.type === 'daily') {
    return 'Every day';
  } else if (habit.frequency.type === 'weekly') {
    const days = habit.frequency.targetDays || [];

    if (days.length === 7) return 'Every day';
    if (days.length === 0) return 'Weekly';

    const weekdayMap = new Map(WEEKDAY.map(w => [w.value, w.label]));

    const dayNames = days
      .map(day => weekdayMap.get(day))
      .filter((label): label is DAY_LABEL => Boolean(label));

    return dayNames.join(', ');
  }

  // Default or custom frequencies
  return habit.frequency.type || 'Custom';
}
