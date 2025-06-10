import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { useCategories } from '@/lib/hooks/use-categories';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Popover, PopoverContent, PopoverTrigger, AlertDialog, AlertDialogAction,
  AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, Calendar, TimeInput, Button, Label, Input
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { ArrowLeft, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { WEEKDAY } from '@/constants/habit-constants';
import { IconSelector, SelectedIcon } from '@/components/IconSelector';
import { Habit } from '@/types';
import { useHabitsWithNotifications } from '@/lib/hooks/use-habits-notifications';

const EditHabit = () => {
  const { habitId } = useParams();
  const { data: habits, isLoading: habitsLoading, updateHabit: updateHabitMutation, deleteHabit: deleteHabitMutation } = useHabitsWithNotifications();

  const { data: categories } = useCategories();
  const navigate = useNavigate();

  const habit = useMemo(() => {
    return habits?.find(h => h.id === Number(habitId));
  }, [habits, habitId]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryIcon, setSelectedCategoryIcon] = useState(undefined);
  const [frequency, setFrequency] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(undefined);
  const [notificationTime, setNotificationTime] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(7);
  const [pauseUntilDate, setPauseUntilDate] = useState(undefined);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPauseConfirmDialog, setShowPauseConfirmDialog] = useState(false);
  const [forceClearEndDate, setForceClearEndDate] = useState(false);

  const hasChanges = useMemo(() => {
    if (!habit) return false;

    const targetDaysChanged = habit.frequency?.type === 'weekly' &&
      JSON.stringify(selectedDays.sort()) !== JSON.stringify((habit.frequency.targetDays || []).sort());

    const endDateChanged = (habit.endAt && !endDate) ||
      (!habit.endAt && endDate) ||
      (habit.endAt && endDate && new Date(habit.endAt).toDateString() !== endDate.toDateString());

    const pauseStateChanged = !!habit.pauseUntil !== isPaused;

    const pauseUntilChanged = (habit.pauseUntil && !pauseUntilDate) ||
      (!habit.pauseUntil && pauseUntilDate) ||
      (habit.pauseUntil && pauseUntilDate &&
        new Date(habit.pauseUntil).toDateString() !== pauseUntilDate.toDateString());

    return (
      name !== habit.name ||
      description !== (habit.description || '') ||
      selectedCategoryIcon?.categoryId !== habit.category ||
      selectedCategoryIcon?.value !== habit.subcategory ||
      frequency !== habit.frequency?.type ||
      notificationTime !== (habit.notificationTime || '') ||
      targetDaysChanged ||
      endDateChanged ||
      pauseStateChanged ||
      pauseUntilChanged
    );
  }, [habit, name, description, selectedCategoryIcon, frequency, selectedDays, notificationTime, endDate, isPaused, pauseUntilDate]);

  const isSubmitting = updateHabitMutation.isPending;
  const isDeleting = deleteHabitMutation.isPending;

  const findSelectedIcon = useCallback((habit) => {
    if (!categories || !habit) return undefined;

    const category = categories.find(cat => cat.id === habit.category);
    if (!category) return undefined;

    const subcategory = category.subcategories.find(sub => sub.value === habit.subcategory);
    if (!subcategory) return undefined;

    return {
      icon: subcategory.icon,
      label: subcategory.label,
      category: category.label,
      categoryId: category.id,
      categoryColor: category.color,
      value: subcategory.value
    };
  }, [categories]);

  useEffect(() => {
    if (habit && categories) {
      setName(habit.name);
      setDescription(habit.description || '');
      setFrequency(habit.frequency?.type || 'daily');

      if (habit.frequency?.targetDays) {
        setSelectedDays(habit.frequency.targetDays);
      }

      setStartDate(new Date(habit.startAt));

      if (habit.endAt) {
        setEndDate(new Date(habit.endAt));
      }

      setNotificationTime(habit.notificationTime || '');
      setIsPaused(!!habit.pauseUntil);

      if (habit.pauseUntil) {
        const pauseDate = new Date(habit.pauseUntil);
        setPauseUntilDate(pauseDate);

        const today = new Date();
        const diffTime = pauseDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if ([7, 14, 30].includes(diffDays)) {
          setPauseDuration(diffDays);
        } else {
          setPauseDuration('custom');
        }
      }

      const selectedIcon = findSelectedIcon(habit);
      setSelectedCategoryIcon(selectedIcon);
    }
  }, [habit, categories, findSelectedIcon]);

  const handleGoBack = useCallback(() => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/');
    }
  }, [hasChanges, navigate]);

  const handleDayToggle = useCallback((day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }, []);

  const calculatePauseDate = useCallback((days) => {
    const pauseDate = new Date();
    pauseDate.setDate(pauseDate.getDate() + days);
    return pauseDate;
  }, []);

  const handlePauseDurationChange = useCallback((duration) => {
    setPauseDuration(duration);
    const pauseDate = calculatePauseDate(duration);
    setPauseUntilDate(pauseDate);

    if (endDate && pauseDate > endDate) {
      setShowPauseConfirmDialog(true);
    }
  }, [endDate, calculatePauseDate]);

  const handlePauseToggle = useCallback((newPausedState) => {
    if (newPausedState && endDate) {
      setShowPauseConfirmDialog(true);
    } else {
      setIsPaused(newPausedState);
      if (!newPausedState) {
        setPauseUntilDate(undefined);
        setPauseDuration(7);
      } else {
        const pauseDate = calculatePauseDate(7);
        setPauseUntilDate(pauseDate);
      }
    }
  }, [endDate, calculatePauseDate]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (isSubmitting || !habitId) return;

    if (!selectedCategoryIcon) {
      toast.error('Please pick an icon for your habit');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    if (frequency === 'weekly' && selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    if (isPaused && pauseDuration === 'custom' && !pauseUntilDate) {
      toast.error('Please select a pause date');
      return;
    }

    let pauseUntilStr = undefined;
    if (isPaused) {
      if (pauseDuration === 'custom' && pauseUntilDate) {
        pauseUntilStr = pauseUntilDate.toISOString();
      } else if (typeof pauseDuration === 'number') {
        pauseUntilStr = calculatePauseDate(pauseDuration).toISOString();
      }
    }

    updateHabitMutation.mutate({
      id: habitId,
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
        category: selectedCategoryIcon.categoryId,
        subcategory: selectedCategoryIcon.value,
        frequency: {
          type: frequency,
          targetDays: frequency === 'weekly' ? selectedDays : undefined
        },
        notificationTime: notificationTime || undefined,
        endAt: forceClearEndDate ? null : (endDate ? endDate.toISOString() : undefined),
        pauseUntil: isPaused ? pauseUntilStr : null,
      }
    }, {
      onSuccess: () => {
        setForceClearEndDate(false);
        navigate('/');
      },
      onError: () => {
        setForceClearEndDate(false);
        toast.error('Failed to update habit. Please try again.');
      }
    });
  }, [isSubmitting, habitId, selectedCategoryIcon, name, frequency, selectedDays, isPaused, pauseDuration, pauseUntilDate, updateHabitMutation, description, notificationTime, forceClearEndDate, endDate, calculatePauseDate, navigate]);

  const handleDelete = useCallback(() => {
    if (habitId && !isDeleting) {
      deleteHabitMutation.mutate(habitId, {
        onSuccess: () => navigate('/'),
        onError: () => toast.error('Failed to delete habit. Please try again.')
      });
    }
  }, [habitId, isDeleting, deleteHabitMutation, navigate]);

  const isWeekly = frequency === 'weekly';
  const isCustomPause = pauseDuration === 'custom';

  if (habitsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <MobileLayout>
          <div className="mobile-container pt-32">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </MobileLayout>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <MobileLayout>
          <div className="mobile-container pt-32">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Habit not found</h1>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl"
              >
                Go back home
              </Button>
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
          <header className="flex items-center justify-between pt-8 pb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="rounded-full w-10 h-10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Habit</h1>
            <div className="w-10"></div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Drink water"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-400 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="8 glasses throughout the day"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-400 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Icon</Label>
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <IconSelector
                    selectedIcon={selectedCategoryIcon}
                    onSelectIcon={setSelectedCategoryIcon}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Frequency</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={frequency === 'daily' ? 'default' : 'outline'}
                    onClick={() => setFrequency('daily')}
                    className={cn(
                      "h-12 rounded-xl font-medium transition-all duration-200",
                      frequency === 'daily'
                        ? "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    )}
                  >
                    Daily
                  </Button>
                  <Button
                    type="button"
                    variant={frequency === 'weekly' ? 'default' : 'outline'}
                    onClick={() => setFrequency('weekly')}
                    className={cn(
                      "h-12 rounded-xl font-medium transition-all duration-200",
                      frequency === 'weekly'
                        ? "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
                        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    )}
                  >
                    Weekly
                  </Button>
                </div>
              </div>

              {isWeekly && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Days</Label>
                  <div className="flex gap-2">
                    {WEEKDAY.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200",
                          selectedDays.includes(day.value)
                            ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
                            : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                        )}
                        onClick={() => handleDayToggle(day.value)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-200">Start Date</Label>
                <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{format(startDate, "PPP")}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start date cannot be changed after creation
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-200">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="endDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 rounded-xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700",
                          !endDate && "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "MMM d") : "None"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 dark:border-slate-700">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < startDate || (isPaused && pauseUntilDate && date < pauseUntilDate);
                        }}
                        initialFocus
                        className="p-3"
                      />
                      <div className="border-t border-gray-200 dark:border-slate-700 px-3 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEndDate(undefined)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Clear
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationTime" className="text-sm font-medium text-gray-700 dark:text-gray-200">Reminder</Label>
                  <TimeInput
                    id="notificationTime"
                    value={notificationTime}
                    onChange={(val) => setNotificationTime(val)}
                    className="h-12 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pauseHabit" className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">
                    Pause habit
                  </Label>
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200",
                        isPaused
                          ? "bg-gradient-to-r from-pink-400 to-purple-400"
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => handlePauseToggle(!isPaused)}
                    >
                      <div
                        className={cn(
                          "bg-white rounded-full h-4 w-4 shadow-sm transform transition-transform duration-200",
                          isPaused ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {isPaused && (
                  <div className="space-y-4 pl-4 border-l-2 border-pink-200 dark:border-pink-800">
                    <div className="space-y-2">
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Duration</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[7, 14, 30].map((days) => (
                          <Button
                            key={days}
                            type="button"
                            variant={pauseDuration === days ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePauseDurationChange(days)}
                            className={cn(
                              "rounded-lg transition-colors duration-200",
                              pauseDuration === days
                                ? "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300"
                            )}
                          >
                            {days}d
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Custom Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={isCustomPause ? "default" : "outline"}
                            onClick={() => setPauseDuration('custom')}
                            className={cn(
                              "w-full justify-start text-left h-10 rounded-lg transition-colors duration-200",
                              isCustomPause
                                ? "bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {isCustomPause && pauseUntilDate
                              ? format(pauseUntilDate, "MMM d")
                              : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 dark:border-slate-700">
                          <Calendar
                            mode="single"
                            selected={pauseUntilDate}
                            onSelect={(date) => {
                              setPauseDuration('custom');
                              setPauseUntilDate(date);
                            }}
                            disabled={(date) => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              tomorrow.setHours(0, 0, 0, 0);
                              return date < tomorrow;
                            }}
                            initialFocus
                            className="p-3"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="destructive"
                className="w-full h-12 rounded-xl bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-500 border border-rose-200 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700/50 transition-all duration-200 group"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                {isDeleting ? 'Deleting...' : 'Delete Habit'}
              </Button>

            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isSubmitting || !hasChanges || !selectedCategoryIcon}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </div>

        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent className="rounded-xl border-gray-200 dark:border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                You have unsaved changes. Are you sure you want to leave?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => navigate('/')}
                className="rounded-lg bg-red-600 hover:bg-red-700"
              >
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="rounded-xl border-gray-200 dark:border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Habit</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete "{name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="rounded-lg bg-red-500 hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showPauseConfirmDialog} onOpenChange={setShowPauseConfirmDialog}>
          <AlertDialogContent className="rounded-xl border-gray-200 dark:border-slate-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">Clear End Date</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Pausing will clear the end date. Continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setForceClearEndDate(true);
                  setEndDate(undefined);
                  setIsPaused(true);
                  const pauseDate = calculatePauseDate(7);
                  setPauseUntilDate(pauseDate);
                  setShowPauseConfirmDialog(false);
                }}
                className="rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MobileLayout>
    </div>
  );
};

export default EditHabit;