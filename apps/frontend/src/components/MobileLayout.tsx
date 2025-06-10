
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarIcon, HomeIcon, Trophy, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { preloader } from '@/lib/query-client';

interface MobileLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export const MobileLayout = ({ children, hideNav = false }: MobileLayoutProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon, preload: null },
    { path: '/calendar', label: 'Calendar', icon: CalendarIcon, preload: 'calendar' },
    { path: '/badges', label: 'Badges', icon: Trophy, preload: 'badges' },
    { path: '/profile', label: 'Profile', icon: UserIcon, preload: 'profile' }
  ] as const;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
      {/* Beautiful gradient overlay - moved behind content */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-100/10 dark:from-gray-900/40 dark:via-transparent dark:to-purple-900/20 rounded-3xl mx-2 backdrop-blur-sm -z-10"></div>
      
      <div className="flex-1 overflow-y-auto px-4 pt-3">
        {children}
      </div>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto transition-all duration-300 px-2 pb-2 z-50">
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
            <div className="flex justify-around items-center py-3 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 relative z-10",
                    isActive(item.path)
                      ? "text-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                  )}
                  onMouseEnter={() => item.preload && preloader.preloadOnHover(item.preload)}
                >
                  <item.icon size={20} className={cn(
                    isActive(item.path) ? "text-primary" : "text-gray-500 dark:text-gray-400",
                    "transition-colors duration-300"
                  )} />
                  <span className={cn(
                    "text-xs mt-1 font-medium transition-colors duration-300",
                    isActive(item.path) ? "text-primary" : ""
                  )}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};
