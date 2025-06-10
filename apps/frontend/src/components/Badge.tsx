
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';
import { Lock, Crown } from 'lucide-react';
import { BadgeWithProgress } from '@/types';
import { useDarkMode } from '@/lib/hooks/use-dark-mode';

interface BadgeProps {
  badge: BadgeWithProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export const Badge = ({ badge, size = 'md', showProgress = false }: BadgeProps) => {
  const [showModal, setShowModal] = useState(false);
  const isEarned = badge.isEarned;
  const { isDarkMode } = useDarkMode();

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500';
      case 'epic':
        return 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600';
      case 'rare':
        return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
      case 'common':
      default:
        return 'bg-streak-gradient';
    }
  };

  return (
    <>
      <div className="flex flex-col items-center" onClick={() => setShowModal(true)}>
        <div
          className={cn(
            'rounded-full flex items-center justify-center mb-2 transition-all duration-300 relative cursor-pointer',
            sizeClasses[size],
            isEarned
              ? `${getRarityGradient(badge.rarity)} shadow-streak animate-pulse-scale`
              : isDarkMode
                ? 'bg-gray-700 opacity-50'
                : 'bg-gray-200 opacity-50'
          )}
        >
          <span role="img" aria-label={badge.name} className={!isEarned ? 'opacity-50' : ''}>
            {badge.icon}
          </span>

          {/* Lock Icon for Locked Badges */}
          {!isEarned && (
            <div className="absolute -bottom-1 -right-1 bg-gray-800 dark:bg-gray-900 rounded-full w-6 h-6 flex items-center justify-center border border-gray-600 shadow-sm">
              <Lock size={12} className="text-gray-400" />
            </div>
          )}

          {/* Premium Badge Indicator */}
          {badge.isPremium && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center border border-yellow-400 shadow-sm">
              <Crown size={12} className="text-white" />
            </div>
          )}
        </div>

        <div className="text-center">
          <h4 className={cn(
            'font-medium text-sm min-h-[40px] flex items-center justify-center',
            isEarned ? 'text-primary' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
          )}>
            <span className="line-clamp-2">{badge.name}</span>
          </h4>

          {/* Progress bar only shown when explicitly requested */}
          {showProgress && badge.progress !== undefined && !isEarned && (
            <div className={cn(
              "w-full rounded-full h-1.5 mt-2",
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            )}>
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `${badge.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Badge Detail Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span role="img" aria-label={badge.name} className="text-2xl">
                {badge.icon}
              </span>
              <span className="flex items-center gap-2">
                {badge.name}
                {badge.isPremium && <Crown size={16} className="text-yellow-500" />}
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  badge.rarity === 'legendary' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                  badge.rarity === 'epic' && "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", 
                  badge.rarity === 'rare' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                  badge.rarity === 'common' && "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                )}>
                  {badge.rarity}
                </span>
              </span>
              {!isEarned && <Lock size={16} className="text-gray-400 ml-1" />}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <DialogDescription>
              {badge.description}
            </DialogDescription>

            <div className="border-t pt-4 dark:border-gray-700">
              <h4 className="text-sm font-medium mb-2">How to earn</h4>
              <p className="text-sm text-muted-foreground">
                {badge.criteria}
              </p>
            </div>

            {isEarned && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-100 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Earned on {formatEarnedDate(badge.earnedAt!)}
                </p>
              </div>
            )}

            {!isEarned && badge.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{Math.round(badge.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${badge.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const formatEarnedDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

