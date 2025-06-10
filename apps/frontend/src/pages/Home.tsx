import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { MobileLayout } from '@/components/MobileLayout';
import { HabitsList } from '@/components/HabitsList';
import { DailyQuote } from '@/components/DailyQuote';
import { isHabitPaused, isHabitEnded, formatLocalDateString, isHabitCompletedOnDate, isHabitDeleted } from '@/lib/utils/habit-utils';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, CheckCircle, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import CelebrationScreen from '@/components/CelebrationScreen';
import { useHabitsWithNotifications } from '@/lib/hooks/use-habits-notifications';

const Home = () => {
  const {
    data: habitsResponse,
    isLoading,
    error,
    toggleHabitCompletion,
  } = useHabitsWithNotifications();

  const [activeTab, setActiveTab] = useState<'today'|'all'>('today');
  const [showCelebration, setShowCelebration] = useState(false);

  const allHabits = useMemo(() => {
    return habitsResponse ?? [];
  }, [habitsResponse]);

  const habits = useMemo(() => {
    return allHabits.filter(habit => !isHabitDeleted(habit) && !isHabitEnded(habit));
  }, [allHabits]);

  const todayHabits = useMemo(() => {
    const today = new Date();

    return habits.filter(habit => {
      if (isHabitDeleted(habit) || isHabitEnded(habit)) {
        return false;
      }

      const startDate = new Date(habit.startAt);
      startDate.setHours(0, 0, 0, 0);

      const todayCopy = new Date(today);
      todayCopy.setHours(0, 0, 0, 0);

      if (startDate > todayCopy) {
        return false;
      }

      if (habit.pauseUntil) {
        const pauseUntilDate = new Date(habit.pauseUntil);
        pauseUntilDate.setHours(0, 0, 0, 0);

        if (todayCopy <= pauseUntilDate) {
          return false;
        }
      }

      if (habit.frequency.type === 'daily') {
        return true;
      }

      if (habit.frequency.type === 'weekly' && habit.frequency.targetDays) {
        const dayOfWeek = today.getDay();
        return habit.frequency.targetDays.includes(dayOfWeek);
      }

      return false;
    });
  }, [habits]);

  const areAllHabitsCompletedToday = useMemo(() => {
    if (todayHabits.length === 0) return false;
    return todayHabits.every(habit => isHabitCompletedOnDate(habit, new Date()));
  }, [todayHabits]);

  const filteredHabits = activeTab === 'today' ? todayHabits : habits;
  const pausedHabits = habits.filter(isHabitPaused);

  const getCelebrationKey = (date) => `celebration_shown_${date}`;
  const hasCelebrationBeenShown = (date) => sessionStorage.getItem(getCelebrationKey(date)) === 'true';
  const markCelebrationAsShown = (date) => sessionStorage.setItem(getCelebrationKey(date), 'true');

  useEffect(() => {
    if (!isLoading && todayHabits.length > 0) {
      const allCompleted = areAllHabitsCompletedToday;
      const today = formatLocalDateString(new Date());
      const shouldShowCelebration = allCompleted && !hasCelebrationBeenShown(today);

      if (shouldShowCelebration) {
        setShowCelebration(true);
        markCelebrationAsShown(today);
      }
    }
  }, [habits, isLoading, todayHabits, areAllHabitsCompletedToday]);

  const handleCelebrationFinish = () => {
    setShowCelebration(false);
  };

  const handleToggleCompletion = (habitId) => {
    const today = new Date();
    const dateStr = formatLocalDateString(today);
    toggleHabitCompletion({ habitId, date: dateStr });
  };

  const getRandomEmoji = () => {
    const emojis = ['🌸', '🌻', '🦋', '🌈', '✨', '🌿', '🍃', '💫', '🌺', '🌙'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning, sunshine', emoji: '☀️' };
    if (hour < 17) return { text: 'Lovely afternoon', emoji: '🌤️' };
    return { text: 'Evening vibes', emoji: '🌙' };
  };

  const greeting = getTimeBasedGreeting();

  return (
    <MobileLayout>
      {showCelebration && (
        <CelebrationScreen
          onFinish={handleCelebrationFinish}
        />
      )}
      
        <div className="mobile-container pb-32">
          <div className="max-w-md mx-auto px-4">
            <header className="pt-8 pb-6">
              <div className="relative px-6 py-6 mb-6 rounded-3xl bg-gradient-to-r from-pink-100/80 via-purple-50/80 to-blue-100/80 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-pink-900/20 backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <div className="absolute top-4 right-4 text-2xl animate-pulse">
                  {greeting.emoji}
                </div>
                <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-2 tracking-wide">
                  {greeting.text} 
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-light">
                  {format(new Date(), 'EEEE, MMMM d')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-4 py-2 rounded-full font-medium text-emerald-700 bg-emerald-100/80 dark:text-emerald-200 dark:bg-emerald-900/30 backdrop-blur-sm">
                    You've got this {getRandomEmoji()}
                  </span>
                  {todayHabits.length > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Today's progress</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
                            style={{ width: `${(todayHabits.filter(h => isHabitCompletedOnDate(h, new Date())).length / todayHabits.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {todayHabits.filter(h => isHabitCompletedOnDate(h, new Date())).length}/{todayHabits.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm shadow-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Oops! Something went wrong: {error.message}
                </p>
              </div>
            )}

            <div className="mb-8">
              <DailyQuote />
            </div>

            <section className="mt-8 space-y-6">
            <div className="flex justify-center mb-8">
              <div className="flex gap-1 p-1 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/30 shadow-lg">
                <button
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    activeTab === 'today'
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
                  )}
                  onClick={() => setActiveTab('today')}
                >
                  <CheckCircle size={16} className={activeTab === 'today' ? 'animate-pulse' : ''} />
                  Today
                </button>
                <button
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    activeTab === 'all'
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10'
                  )}
                  onClick={() => setActiveTab('all')}
                >
                  <Calendar size={16} className={activeTab === 'all' ? 'animate-pulse' : ''} />
                  All Habits
                </button>
              </div>
            </div>

              <div className="mb-6 text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {activeTab === 'today'
                    ? "Today's little victories ✨"
                    : "Your beautiful habit garden 🌱"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                  {activeTab === 'today' ? (
                    <>
                      {todayHabits.length === 0 ? 
                        "Take a moment to breathe" : 
                        `${todayHabits.length} gentle step${todayHabits.length !== 1 ? 's' : ''} ahead`
                      }
                      {pausedHabits.length > 0 && (
                        <span className="block text-xs mt-1 text-amber-600 dark:text-amber-400">
                          {pausedHabits.length} taking a little break 😌
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {habits.length === 0 ? 
                        "Ready to plant some seeds?" : 
                        `${habits.length} beautiful habit${habits.length !== 1 ? 's' : ''} growing`
                      }
                      {pausedHabits.length > 0 && (
                        <span className="block text-xs mt-1 text-amber-600 dark:text-amber-400">
                          {pausedHabits.length} resting peacefully
                        </span>
                      )}
                    </>
                  )}
                </p>
              </div>

              <HabitsList
                loading={isLoading}
                habits={filteredHabits}
                viewType={activeTab}
                onToggleCompletion={activeTab === 'today' ? handleToggleCompletion : undefined}
              />

              {filteredHabits.length === 0 && !isLoading && (
                <div className="text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-white/80 via-pink-50/50 to-purple-50/50 dark:from-white/5 dark:via-purple-900/10 dark:to-pink-900/10 backdrop-blur-sm border border-white/30 shadow-lg">
                  <div className="text-7xl mb-6 animate-bounce">
                    {activeTab === 'today' && habits.length === 0 && "🌱"}
                    {activeTab === 'today' && habits.length > 0 && "🎉"}
                    {activeTab === 'all' && "✨"}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    {activeTab === 'today' && habits.length === 0 && "Your journey begins here"}
                    {activeTab === 'today' && habits.length > 0 && "You're all caught up!"}
                    {activeTab === 'all' && "Ready to bloom?"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-light leading-relaxed">
                    {activeTab === 'today' && habits.length === 0 && (
                      "Every small step counts. What would you like to nurture today?"
                    )}
                    {activeTab === 'today' && habits.length > 0 && (
                      <>
                        You've completed everything for today! Time to celebrate the little wins 🎈
                        {pausedHabits.length > 0 && (
                          <span className="block mt-2 text-amber-600 dark:text-amber-400">
                            {pausedHabits.length} habit{pausedHabits.length !== 1 ? 's' : ''} are taking a well-deserved rest
                          </span>
                        )}
                      </>
                    )}
                    {activeTab === 'all' && (
                      "Your habit collection is waiting to be filled with wonderful intentions"
                    )}
                  </p>
                </div>
              )}
            </section>
          </div>

        <div className="fixed bottom-28 right-1/2 transform translate-x-1/2 z-50">
          <Link to="/add-habit">
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-400/80 via-purple-400/80 to-blue-400/80 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-500 border border-white/40 backdrop-blur-sm"
              aria-label="Add new habit"
            >
              <Plus size={24} className="text-white drop-shadow-sm" />
            </Button>
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Home;