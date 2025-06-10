export type HabitCategory =
  | 'personal'
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'productivity'
  | 'learning'
  | 'finance'
  | 'social'
  | 'environmental'
  | 'hobbies'
  | 'other';

  export type HabitSubcategory =
  | 'running' | 'strength' | 'cycling' | 'workout' | 'climbing' | 'swimming' | 'sports'
  | 'hydration' | 'nutrition' | 'sleep' | 'medication' | 'checkup' | 'dental' | 'mental'
  | 'yoga' | 'meditation' | 'gratitude' | 'journaling' | 'prayer'
  | 'reading' | 'writing' | 'studying' | 'skills' | 'coding' | 'language' | 'research'
  | 'planning' | 'time_mgmt' | 'work' | 'goals' | 'progress' | 'tasks' | 'track'
  | 'creative' | 'music' | 'nature' | 'self_care' | 'family' | 'pets' | 'home'
  | 'saving' | 'budget' | 'investing' | 'expense' | 'bills'
  | 'friends' | 'reach_out' | 'events' | 'network' | 'dating' | 'give'
  | 'recycle' | 'eco_friendly' | 'walk' | 'save_water' | 'energy'
  | 'photography' | 'gaming' | 'crafting' | 'art' | 'knitting' | 'movies' | 'cooking' | 'gardening'
  | 'custom' | 'routine' | 'reminder' | 'general' | 'habit' | 'fun' | 'challenge' | 'avoid' | 'track_other';

export type HabitColor =
  | 'blue'    // personal
  | 'green'   // health
  | 'red'     // fitness
  | 'purple'  // mindfulness
  | 'orange'  // productivity
  | 'yellow'  // learning
  | 'emerald' // finance
  | 'pink'    // social
  | 'teal'    // environmental
  | 'indigo'  // hobbies
  | 'gray';   // other


export type frequencyType = 'daily' | 'weekly';


export type CompletionStatus = 'completed' | 'incomplete';


export interface Completion {
  id: number;
  habitId: number;
  userId: number;
  mood?: string;
  note?: string;
  status: CompletionStatus;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  category: HabitCategory;
  subcategory: HabitSubcategory;
  icon: string;
  color: HabitColor;
  startAt: string;
  endAt?: string | null;
  notificationTime?: string | null;
  pauseUntil?: string | null;
  frequency: {
    type: frequencyType;
    targetDays?: number[]; 
  };
  completions: Completion[];
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  createdAt: string;
  deletedAt: string;
}


export interface CreateHabitRequest {
  name: string;
  description?: string;
  category: HabitCategory;
  subcategory: HabitSubcategory;
  frequency: {
    type: frequencyType;
    targetDays?: number[]; 
  };
  startAt?: string;
  endAt?: string | null;
  notificationTime?: string | null;
  pauseUntil?: string | null;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  notificationTime?: string | null;
  pauseUntil?: string | null;
  endAt?: string | null;
}

export interface ToggleCompletionRequest {
  habitId: number;
  date: string;
  // mood?: string;
  // notes?: string;
}

export interface ToggleCompletionResponse {
  habit: {
    id: number;
    name: string;
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
  };
  action: string;
  newBadges: string[];
  message: string;
}


export interface HabitDayDetail {
  id: number;
  name: string;
  completed: boolean;
  mood?: string;
  notes?: string;
  completedAt?: string;
}

export interface DailySummary {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  status: 'complete' | 'partial' | 'none';
  habits: HabitDayDetail[];
}

export interface HabitHistory {
  dailySummaries: DailySummary[];
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
}
