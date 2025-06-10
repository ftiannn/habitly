
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui';
import { useDarkMode } from '@/lib/hooks/use-dark-mode';

export const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex items-center">
      <Sun size={16} className="text-yellow-500 mr-2" />
      <Switch
        checked={isDarkMode}
        onCheckedChange={toggleDarkMode}
      />
      <Moon size={16} className="text-gray-400 dark:text-blue-300 ml-2" />
    </div>
  );
};
