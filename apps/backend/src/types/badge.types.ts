export interface BadgeWithProgress {
    id: string;
    name: string;
    description: string;
    icon: string;
    progress: number;
    earnedAt?: Date | null;
  }
  
  export type badgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
  export type badgeCategory = 'streak' | 'consistency' | 'milestone' | 'category' | 'diversity' | 'premium' | 'general';
  
  export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
    isPremium: boolean;
    rarity: badgeRarity;
    category: badgeCategory;
  }
  
  export interface BadgeWithProgress extends BadgeDefinition {
    progress: number;         
    isEarned: boolean;        
  }
  
  export interface BadgeResponse {
    badges: BadgeWithProgress[];
    stats: {
      total: number;
      earned: number;
      locked: number;
      completionRate: number;
    };
  }
  