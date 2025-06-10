export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  isPremium: boolean;
  rarity: BadgeRarity;
  category: string;
}

export interface BadgeWithProgress extends BadgeDefinition {
  progress: number;
  earnedAt: string | null;
  isEarned: boolean;
}

export interface BadgeStats {
  total: number;
  earned: number;
  locked: number;
  completionRate: number;
}

export interface UserBadgesResponse {
  badges: BadgeWithProgress[];
  earnedBadges: BadgeWithProgress[];
  lockedBadges: BadgeWithProgress[];
  stats: BadgeStats;
}
