import { categoryConfig } from '@/config/category.config';
import { createDBContext, DBContext } from '@/lib/prisma';
import { HabitWithStats, CreateHabitInput, UpdateHabitInput, ToggleHabitInput, DailyHabitSummary, HabitDayDetail } from '@/types/habit.types';
import { Category, CompletionStatus } from '@prisma/client';

export class habitService {
  static async getUserHabits(ctx: DBContext, userId: number): Promise<HabitWithStats[]> {
    const habits = await ctx.db.habit.findMany({
      where: { userId, deletedAt: null },
      include: {
        completions: {
          where: { status: CompletionStatus.completed },
          orderBy: { completedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      habits.map(async (habit: any) => {
        const stats = this.calculateHabitStats(habit);
        return this.mapHabitConfig(stats);
      })
    );
  }

  static async getHabitById(ctx: DBContext, habitId: number, userId: number): Promise<HabitWithStats | null> {
    const habit = await ctx.db.habit.findFirst({
      where: { id: habitId, userId, deletedAt: null },
      include: {
        completions: {
          where: { status: CompletionStatus.completed },
          orderBy: { completedAt: 'desc' },
        },
      }
    });

    if (!habit) return null;

    const habitWithConfig = this.mapHabitConfig(habit);

    return this.calculateHabitStats(habitWithConfig);
    }

  static async createHabit(ctx: DBContext, userId: number, input: CreateHabitInput): Promise<HabitWithStats> {
    const habit = await ctx.db.habit.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        category: input.category,
        subcategory: input.subcategory,
        frequency: input.frequency,
        startAt: input.startAt || new Date(),
        endAt: input.endAt,
        notificationTime: input.notificationTime,
        pauseUntil: input.pauseUntil,
      },
      include: {
        completions: {
          where: { status: CompletionStatus.completed },
        },
      },
    });

    const habitWithConfig = this.mapHabitConfig(habit);
    
    return this.calculateHabitStats(habitWithConfig);
  }

  
  static async updateHabit(ctx: DBContext, habitId: number, userId: number, input: UpdateHabitInput): Promise<HabitWithStats> {
    const existingHabit = await this.getHabitById(ctx, habitId, userId);
    if (!existingHabit) throw new Error('Habit not found');

    const habit = await ctx.db.habit.update({
      where: { id: habitId },
      data: { ...input },
      include: {
        completions: {
          where: { status: CompletionStatus.completed },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    const habitWithConfig = this.mapHabitConfig(habit);
    
    return this.calculateHabitStats(habitWithConfig);
  }

  static async deleteHabit(ctx: DBContext, habitId: number, userId: number): Promise<void> {
    const existingHabit = await this.getHabitById(ctx, habitId, userId);
    if (!existingHabit) throw new Error('Habit not found');

    await ctx.db.habit.update({
      where: { id: habitId },
      data: { deletedAt: new Date() },
    });
  }

  static async restoreHabit(ctx: DBContext, habitId: number, userId: number): Promise<HabitWithStats> {
    const habit = await ctx.db.habit.findFirst({
      where: { id: habitId, userId },
      include: {
        completions: {
          where: { status: CompletionStatus.completed },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!habit) throw new Error('Habit not found');

    const now = new Date();

    const isDeleted = habit.deletedAt !== null;
    const isExpired = habit.endAt !== null && habit.endAt < now;

    if (!isDeleted && !isExpired) {
      throw new Error('Habit is neither deleted nor expired and cannot be restored');
    }

    const restoredHabit = await ctx.db.habit.update({
      where: { id: habitId },
      data: {
        deletedAt: null,
        endAt: null,
        pauseUntil: null,
      },
      include: {
        completions: {
          where: { status: CompletionStatus.completed },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    const habitWithConfig = this.mapHabitConfig(restoredHabit);
    
    return this.calculateHabitStats(habitWithConfig);
  }

  static async toggleHabitCompletion(
    ctx: DBContext,
    userId: number,
    input: ToggleHabitInput
  ): Promise<{ habit: HabitWithStats; action: 'completed' | 'uncompleted'; }> {
    return ctx.db.$transaction(async (tx: any) => {
      const txCtx = createDBContext(tx);
      const habit = await this.getHabitById(txCtx, input.habitId, userId);
      if (!habit) throw new Error('Habit not found');

      const completionDate = new Date(input.date);
      completionDate.setHours(0, 0, 0, 0);

      const existingCompletion = await tx.habitCompletionRecord.findUnique({
        where: {
          habitId_completedAt: {
            habitId: input.habitId,
            completedAt: completionDate,
          },
        },
      });

      let completion = null;
      let action: 'completed' | 'uncompleted';

      if (existingCompletion) {
        await tx.habitCompletionRecord.delete({ where: { id: existingCompletion.id } });
        action = 'uncompleted';
      } else {
        await tx.habitCompletionRecord.create({
          data: {
            habitId: input.habitId,
            userId,
            status: CompletionStatus.completed,
            mood: input.mood,
            notes: input.notes,
            completedAt: completionDate,
          },
        });
        action = 'completed';
      }

      const updatedHabit = await this.getHabitById(txCtx, input.habitId, userId);
      return { habit: updatedHabit!, action };
    });
  }

  private static mapHabitConfig(habit: any): HabitWithStats {
    const categoryData = categoryConfig[habit.category as Category];
    const subcategoryData = categoryData?.subcategories.find(sub => sub.value === habit.subcategory);

    return {
      ...habit,
      icon: subcategoryData?.icon ?? '⭐',
      color: categoryData?.color || 'gray',
    };
  }

  private static calculateHabitStats(habit: Omit<HabitWithStats, 'currentStreak' | 'longestStreak' | 'totalCompletions' | 'completionRate'>): HabitWithStats {
    const completions = habit.completions
      .filter((c: any) => c.status === CompletionStatus.completed)
      .sort((a: any, b: any) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );
  
    const totalCompletions = completions.length;
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const completionDates = new Set(
      completions.map(c =>
        new Date(c.completedAt).toISOString().split('T')[0]
      )
    );
  
    let currentStreak = 0;
    const currentDate = new Date(today);
  
    const todayStr = today.toISOString().split('T')[0];
    if (!completionDates.has(todayStr)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
  
    while (completionDates.has(currentDate.toISOString().split('T')[0])) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
  
    for (const completion of completions) {
      const completionDate = new Date(completion.completedAt);
      completionDate.setHours(0, 0, 0, 0);
  
      if (lastDate) {
        const diffDays =
          (completionDate.getTime() - lastDate.getTime()) /
          (1000 * 60 * 60 * 24);
  
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
  
      lastDate = completionDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  
    const startDate = new Date(habit.startAt);
    startDate.setHours(0, 0, 0, 0);
  
    const daysSinceStart = Math.max(
      1,
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
  
    const completionRate = (totalCompletions / daysSinceStart) * 100;
  
    return {
      ...habit,
      currentStreak,
      longestStreak,
      totalCompletions,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }
  

  static async getHabitHistory(
    ctx: DBContext,
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<DailyHabitSummary[]> {
    const habits = await ctx.db.habit.findMany({
      where: {
        userId,
        deletedAt: null,
        startAt: { lte: endDate }
      },
      include: {
        completions: {
          where: {
            status: CompletionStatus.completed,
            completedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });

    const dailySummaries: DailyHabitSummary[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      const activeHabits = habits.filter(habit => {
        const habitStart = new Date(habit.startAt);
        habitStart.setHours(0, 0, 0, 0);

        const checkDate = new Date(currentDate);
        checkDate.setHours(0, 0, 0, 0);

        const isActive = habitStart <= checkDate;
        const notEnded = !habit.endAt || new Date(habit.endAt) >= checkDate;
        const notPaused = !habit.pauseUntil || new Date(habit.pauseUntil) < checkDate;

        return isActive && notEnded && notPaused;
      });

      const habitDetails: HabitDayDetail[] = activeHabits.map(habit => {
        const completion = habit.completions.find(c =>
          c.completedAt.toISOString().split('T')[0] === dateStr
        );

        return {
          id: habit.id,
          name: habit.name,
          completed: !!completion,
          mood: completion?.mood || undefined,
          notes: completion?.notes || undefined,
          completedAt: completion?.completedAt || undefined
        };
      });

      const completedCount = habitDetails.filter(h => h.completed).length;
      const totalCount = habitDetails.length;
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      let status: 'complete' | 'partial' | 'none' = 'none';
      if (completionRate === 100 && totalCount > 0) status = 'complete';
      else if (completionRate > 0) status = 'partial';

      dailySummaries.push({
        date: dateStr,
        totalHabits: totalCount,
        completedHabits: completedCount,
        completionRate: Math.round(completionRate * 100) / 100,
        status,
        habits: habitDetails
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailySummaries;
  }
}
