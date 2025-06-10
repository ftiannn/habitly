import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import {
  Button, Input, Label, Calendar, TimeInput, AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar as CalendarIcon, Heart } from 'lucide-react';
import { IconSelector, SelectedIcon } from '@/components/IconSelector';
import { WEEKDAY } from '@/constants/habit-constants';
import { useHabitsWithNotifications } from '@/lib/hooks/use-habits-notifications';

const AddHabit = () => {
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
  const [showPauseConfirmDialog, setShowPauseConfirmDialog] = useState(false);

  const { createHabit: createHabitMutation } = useHabitsWithNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (createHabitMutation.isSuccess) {
      navigate('/');
    }
  }, [createHabitMutation.isSuccess, navigate]);

  const hasChanges = useMemo(() => {
    return name !== '' || description !== '' || selectedCategoryIcon !== undefined;
  }, [name, description, selectedCategoryIcon]);

  const isSubmitting = createHabitMutation.isPending;

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

    if (isSubmitting) return;

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

    createHabitMutation.mutate({
      name: name.trim(),
      description: description.trim() || '',
      category: selectedCategoryIcon.categoryId,
      subcategory: selectedCategoryIcon.value,
      frequency: {
        type: frequency,
        targetDays: frequency === 'weekly' ? selectedDays : undefined
      },
      notificationTime: notificationTime || undefined,
      startAt: startDate.toISOString(),
      endAt: endDate?.toISOString(),
      pauseUntil: isPaused ? pauseUntilStr : undefined,
    });
  }, [isSubmitting, selectedCategoryIcon, name, description, frequency, selectedDays, isPaused, pauseDuration, pauseUntilDate, startDate, endDate, notificationTime, calculatePauseDate, createHabitMutation]);

  const isWeekly = frequency === 'weekly';
  const isCustomPause = pauseDuration === 'custom';

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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">New Habit</h1>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-200">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="startDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-12 rounded-xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "MMM d")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-gray-200 dark:border-slate-700">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-200">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="endDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 rounded-xl bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700",
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

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pauseHabit" className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">
                    Start paused
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
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isSubmitting || !selectedCategoryIcon}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Habit'
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

export default AddHabit;