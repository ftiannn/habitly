import { createDBContext, DBContext, withTransaction } from "@/lib/prisma";
import { badgeCategory, BadgeDefinition, badgeRarity, BadgeWithProgress } from "@/types/badge.types";

export class badgeService {
  /**
   * Get all badge definitions from database (single source of truth)
   */
  static async getAllBadgeDefinitions(ctx: DBContext): Promise<BadgeDefinition[]> {
    const badges = await ctx.db.badge.findMany({
      orderBy: [
        { isPremium: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    });

    return badges.map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description || '',
      icon: badge.icon,
      criteria: badge.criteria || '',
      isPremium: badge.isPremium || false,
      rarity: badge.rarity as badgeRarity,
      category: badge.category as badgeCategory
    }));
  }

  /**
   * Get user badges with progress - now includes ALL badge definitions
   */
  static async getUserBadges(ctx: DBContext, userId: number): Promise<BadgeWithProgress[]> {
    const [allBadges, userBadges, habits] = await Promise.all([
      ctx.db.badge.findMany({ 
        orderBy: [
          { isPremium: 'asc' },
          { rarity: 'asc' },
          { name: 'asc' }
        ]
      }),
      ctx.db.userBadge.findMany({ where: { userId } }),
      ctx.db.habit.findMany({
        where: { userId, deletedAt: null },
        include: {
          completions: {
            where: { status: 'completed' },
            orderBy: { completedAt: 'desc' },
          },
        },
      }),
    ]);

    return allBadges.map((badge: any) => {
      const userBadge = userBadges.find((ub: any) => ub.badgeId === badge.id);
      const progress = this.calculateBadgeProgress(badge, habits);

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description || '',
        icon: badge.icon,
        criteria: badge.criteria || '',
        isPremium: badge.isPremium || false,
        rarity: badge.rarity as badgeRarity,
        category: badge.category || 'general',
        progress,
        earnedAt: userBadge?.earnedAt || null,
        isEarned: !!userBadge?.earnedAt,
      };
    });
  }

  /**
   * Check and award badges - now database-driven
   */
  static async checkAndAwardBadges(ctx: DBContext, userId: number): Promise<string[]> {
    return withTransaction(async (tx: any) => {
      const txCtx = createDBContext(tx);
      
      const [allBadges, userBadges, habits] = await Promise.all([
        txCtx.db.badge.findMany(),
        txCtx.db.userBadge.findMany({ where: { userId } }),
        txCtx.db.habit.findMany({
          where: { userId, deletedAt: null },
          include: {
            completions: {
              where: { status: 'completed' },
              orderBy: { completedAt: 'desc' },
            },
          },
        }),
      ]);

      const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
      const newlyEarnedBadges: string[] = [];

      for (const badge of allBadges) {
        if (!earnedBadgeIds.includes(badge.id)) {
          const isEarned = this.checkBadgeCriteria(badge, habits);
          
          if (isEarned) {
            await txCtx.db.userBadge.create({
              data: {
                userId,
                badgeId: badge.id,
                earnedAt: new Date(),
              },
            });
            newlyEarnedBadges.push(badge.id);
          }
        }
      }

      return newlyEarnedBadges;
    });
  }

  /**
   * Check if user meets badge criteria - driven by badge.category field
   */
  private static checkBadgeCriteria(badge: any, habits: any[]): boolean {
    switch (badge.category) {
      case 'streak':
        return this.checkStreakBadge(badge.id, habits);
      
      case 'consistency':
        return this.checkConsistencyBadge(badge.id, habits);
      
      case 'milestone':
        return this.checkMilestoneBadge(badge.id, habits);
      
      case 'category':
        return this.checkCategoryBadge(badge.id, habits);
      
      case 'diversity':
        return this.checkDiversityBadge(badge.id, habits);
      
      case 'premium':
        return this.checkPremiumBadge(badge.id, habits);
      
      default:
        return false;
    }
  }

  /**
   * Calculate badge progress - driven by badge.category field
   */
  private static calculateBadgeProgress(badge: any, habits: any[]): number {
    switch (badge.category) {
      case 'streak':
        return this.calculateStreakProgress(badge.id, habits);
      
      case 'consistency':
        return this.calculateConsistencyProgress(badge.id, habits);
      
      case 'milestone':
        return this.calculateMilestoneProgress(badge.id, habits);
      
      case 'category':
        return this.calculateCategoryProgress(badge.id, habits);
      
      case 'diversity':
        return this.calculateDiversityProgress(badge.id, habits);
      
      case 'premium':
        return this.calculatePremiumProgress(badge.id, habits);
      
      default:
        return 0;
    }
  }

  private static checkStreakBadge(badgeId: string, habits: any[]): boolean {
    const streakTargets: Record<string, number> = {
      '3-day-streak': 3,
      'week-warrior': 7,
      'monthly-master': 30,
    };
    
    const target = streakTargets[badgeId];
    if (!target) return false;

    return habits.some(habit => {
      const currentStreak = this.calculateCurrentStreak(habit.completions);
      return currentStreak >= target;
    });
  }

  private static checkConsistencyBadge(badgeId: string, habits: any[]): boolean {
    const consistencyTargets: Record<string, number> = {
      'consistency-king': 5,
      'perfectionist': 7,
    };
    
    const target = consistencyTargets[badgeId];
    if (!target || habits.length === 0) return false;

    const dates = this.getLastNDays(target);
    return dates.every(date =>
      habits.every(habit =>
        habit.completions.some((c: any) =>
          c.completedAt.toISOString().split('T')[0] === date
        )
      )
    );
  }

  private static checkMilestoneBadge(badgeId: string, habits: any[]): boolean {
    const milestoneChecks: Record<string, () => boolean> = {
      'first-step': () => habits.some(h => h.completions.length > 0),
      'habit-builder': () => habits.length >= 3,
      'century-club': () => {
        const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
        return totalCompletions >= 100;
      },
    };
    
    const check = milestoneChecks[badgeId];
    return check ? check() : false;
  }

  private static checkCategoryBadge(badgeId: string, habits: any[]): boolean {
    const categoryChecks: Record<string, () => boolean> = {
      'mindfulness-master': () => {
        const mindfulnessHabits = habits.filter(h => h.category === 'mindfulness');
        return mindfulnessHabits.some(habit => {
          const currentStreak = this.calculateCurrentStreak(habit.completions);
          return currentStreak >= 10;
        });
      },
      'fitness-fanatic': () => {
        const fitnessHabits = habits.filter(h => 
          h.category === 'fitness' || h.category === 'health'
        );
        const totalCompletions = fitnessHabits.reduce((sum, habit) => 
          sum + habit.completions.length, 0
        );
        return totalCompletions >= 20;
      },
      'social-butterfly': () => {
        const socialHabits = habits.filter(h => h.category === 'social');
        const totalCompletions = socialHabits.reduce((sum, habit) => 
          sum + habit.completions.length, 0
        );
        return totalCompletions >= 10;
      },
    };
    
    const check = categoryChecks[badgeId];
    return check ? check() : false;
  }

  private static checkDiversityBadge(badgeId: string, habits: any[]): boolean {
    if (badgeId === 'well-rounded') {
      const categories = new Set(habits.map(h => h.category));
      return categories.size >= 4;
    }
    return false;
  }

  private static checkPremiumBadge(badgeId: string, habits: any[]): boolean {
    // TODO: add premium badge check
    return false;
  }

  private static calculateStreakProgress(badgeId: string, habits: any[]): number {
    const streakTargets: Record<string, number> = {
      '3-day-streak': 3,
      'week-warrior': 7,
      'monthly-master': 30,
    };
    
    const target = streakTargets[badgeId];
    if (!target) return 0;

    const maxStreak = Math.max(0, ...habits.map(h =>
      this.calculateCurrentStreak(h.completions)
    ));
    return Math.min(100, (maxStreak / target) * 100);
  }

  private static calculateConsistencyProgress(badgeId: string, habits: any[]): number {
    const consistencyTargets: Record<string, number> = {
      'consistency-king': 5,
      'perfectionist': 7,
    };
    
    const target = consistencyTargets[badgeId];
    if (!target || habits.length === 0) return 0;

    const dates = this.getLastNDays(target);
    let consecutiveDays = 0;

    for (const date of dates) {
      const allCompleted = habits.every(habit =>
        habit.completions.some((c: any) =>
          c.completedAt.toISOString().split('T')[0] === date
        )
      );

      if (allCompleted) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return Math.min(100, (consecutiveDays / target) * 100);
  }

  private static calculateMilestoneProgress(badgeId: string, habits: any[]): number {
    const progressCalculators: Record<string, () => number> = {
      'first-step': () => {
        const hasAnyCompletion = habits.some(h => h.completions.length > 0);
        return hasAnyCompletion ? 100 : 0;
      },
      'habit-builder': () => Math.min(100, (habits.length / 3) * 100),
      'century-club': () => {
        const totalCompletions = habits.reduce((sum, h) => sum + h.completions.length, 0);
        return Math.min(100, (totalCompletions / 100) * 100);
      },
    };
    
    const calculator = progressCalculators[badgeId];
    return calculator ? calculator() : 0;
  }

  private static calculateCategoryProgress(badgeId: string, habits: any[]): number {
    const progressCalculators: Record<string, () => number> = {
      'mindfulness-master': () => {
        const mindfulnessHabits = habits.filter(h => h.category === 'mindfulness');
        if (mindfulnessHabits.length === 0) return 0;
        const maxStreak = Math.max(0, ...mindfulnessHabits.map(h =>
          this.calculateCurrentStreak(h.completions)
        ));
        return Math.min(100, (maxStreak / 10) * 100);
      },
      'fitness-fanatic': () => {
        const fitnessHabits = habits.filter(h => 
          h.category === 'fitness' || h.category === 'health'
        );
        if (fitnessHabits.length === 0) return 0;
        const totalCompletions = fitnessHabits.reduce((sum, habit) => 
          sum + habit.completions.length, 0
        );
        return Math.min(100, (totalCompletions / 20) * 100);
      },
      'social-butterfly': () => {
        const socialHabits = habits.filter(h => h.category === 'social');
        if (socialHabits.length === 0) return 0;
        const totalCompletions = socialHabits.reduce((sum, habit) => 
          sum + habit.completions.length, 0
        );
        return Math.min(100, (totalCompletions / 10) * 100);
      },
    };
    
    const calculator = progressCalculators[badgeId];
    return calculator ? calculator() : 0;
  }

  private static calculateDiversityProgress(badgeId: string, habits: any[]): number {
    if (badgeId === 'well-rounded') {
      const categories = new Set(habits.map(h => h.category));
      return Math.min(100, (categories.size / 4) * 100);
    }
    return 0;
  }

  private static calculatePremiumProgress(badgeId: string, habits: any[]): number {
    // TODO: Premium badges progress calculation
    return 0;
  }

  private static calculateCurrentStreak(completions: any[]): number {
    if (completions.length === 0) return 0;
  
    const completionDates = new Set(
      completions.map(c =>
        new Date(c.completedAt).toISOString().split('T')[0]
      )
    );
  
    let streak = 0;
  
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
  
    const todayStr = currentDate.toISOString().split('T')[0];
    if (!completionDates.has(todayStr)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
  
    while (completionDates.has(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
  
    return streak;
  }
  
  private static getLastNDays(n: number): string[] {
    const dates: string[] = [];
    for (let i = 0; i < n; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }
}