
import { MobileLayout } from '@/components/MobileLayout';
import { Badge } from '@/components/Badge';
import { useBadges, useBadgeDefinitions } from '@/lib/hooks/use-badges';
import { useMemo } from 'react';
import { LoadingLottie } from '@/components/ui';
import { LOTTIE_ANIMATIONS } from '@/constants/lottie-animations';

const BadgesPage = () => {
  const { data: userBadgesData, isLoading: userBadgesLoading, error: userBadgesError } = useBadges();
  const { data: badgeDefinitions, isLoading: definitionsLoading } = useBadgeDefinitions();

  const { earnedBadges, lockedBadges, stats } = useMemo(() => {
    if (!userBadgesData) {
      return { earnedBadges: [], lockedBadges: [], stats: { total: 0, earned: 0, locked: 0, completionRate: 0 } };
    }

    return {
      earnedBadges: userBadgesData.earnedBadges || [],
      lockedBadges: userBadgesData.lockedBadges || [],
      stats: userBadgesData.stats || { total: 0, earned: 0, locked: 0, completionRate: 0 }
    };
  }, [userBadgesData]);

  const isLoading = userBadgesLoading || definitionsLoading;

  return (
    <MobileLayout>
      <div className="mobile-container pb-16">
        <header className="pt-6 pb-4">
          <h1 className="text-2xl font-bold">Your Badges</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {stats.total > 0 ? (
              <>
                <span className="font-medium text-foreground">
                  {stats.earned} of {stats.total}
                </span>{" "}
                badges unlocked • Completion rate:{" "}
                <span className="font-medium text-foreground">
                  {stats.completionRate}%
                </span>
              </>
            ) : (
              "Start building habits to unlock badges!"
            )}
          </p>
        </header>

        {/* Error State */}
        {userBadgesError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-lg mb-4">
            <p className="text-sm">Failed to load badges: {userBadgesError.message}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
            <LoadingLottie
              className="flex items-center justify-center py-8"
              src={LOTTIE_ANIMATIONS.basicLoader}
              message="Polishing your shiny badges..."
            />
          </div>
        )}

        {/* Content - only show when not loading */}
        {!isLoading && (
          <>

            {/* Earned Badges Section */}
            {earnedBadges.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 transition-colors duration-300">
                <h2 className="font-medium mb-4 border-b dark:border-gray-700 pb-2">Earned Badges ({earnedBadges.length})</h2>
                <div className="grid grid-cols-3 gap-6">
                  {earnedBadges.map(badge => (
                    <Badge
                      key={badge.id}
                      badge={badge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked Badges Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 transition-colors duration-300">
              <h2 className="font-medium mb-4 border-b dark:border-gray-700 pb-2">Locked Badges ({lockedBadges.length})</h2>
              {lockedBadges.length > 0 ? (
                <div className="grid grid-cols-3 gap-6">
                  {lockedBadges.map(badge => (
                    <Badge
                      key={badge.id}
                      badge={badge}
                      showProgress={true}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Congratulations! You've earned all available badges! 🎉
                </p>
              )}
            </div>

            {/* Show help text if no badges earned */}
            {earnedBadges.length === 0 && lockedBadges.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mt-4 px-4">
                <p>Complete habits consistently to earn badges.</p>
                <p className="mt-2">Tap on any badge to see how to earn it!</p>
              </div>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default BadgesPage;
