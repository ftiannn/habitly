
import { useState } from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { useHabits } from '@/lib/hooks/use-habits';
import { useUserProfile, useUpdateUserProfile } from '@/lib/hooks/use-user';
import { Button, Input, Label, Separator, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui';
import {
  LogOut,
  Settings,
  Edit,
  Shield,
  HelpCircle,
  Moon,
  Save,
  X,
  ChevronDown,
  Globe,
  Info,
  Loader2,
  User,
  BarChart3,
  Flame,
  Target,
  Trophy,
  FileText,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { profileSchema, getValidationErrors } from '@/lib/utils/validation-utils';
import { TimezoneDropdown } from '@/components/TimezoneDropdown';
import { UserAvatar } from '@/components/UserAvatar';
import { useAuth } from '@/lib/hooks/use-auth'

const Profile = () => {
  const { data: habits = [] } = useHabits();
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const { user: authUser, logout } = useAuth();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTimezone, setEditTimezone] = useState('');

  const navigate = useNavigate();

  const user = {
    name: userProfile?.name || authUser?.name || 'User',
    email: userProfile?.email || authUser?.email || 'user@example.com',
    photoUrl: userProfile?.photoUrl || undefined,
    timezone: userProfile?.timezone || 'UTC',
    totalHabits: habits.length,
    totalStreak: habits.reduce((total, habit) => total + (habit.currentStreak || 0), 0),
    longestStreak: Math.max(...habits.map(h => h.longestStreak || 0), 0),
    joinedAt: userProfile?.joinedAt || new Date().toISOString(),
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleEditProfile = () => {
    setEditName(user.name);
    setEditTimezone(user.timezone);
    setShowEditDialog(true);
  };

  const handleSaveProfile = async () => {
    const changes: Partial<{ name: string; timezone: string }> = {};

    // Only include fields that changed
    if (editName.trim() !== (user?.name || '')) {
      changes.name = editName.trim();
    }

    if (editTimezone !== (user?.timezone || '')) {
      changes.timezone = editTimezone;
    }

    if (Object.keys(changes).length === 0) {
      setShowEditDialog(false);
      return;
    }

    const validation = profileSchema.safeParse(changes);
    if (!validation.success) {
      const errors = getValidationErrors(validation.error);
      const firstErrorMessage = Object.values(errors)[0];
      toast.error(firstErrorMessage);
      return;
    }

    await updateProfileMutation.mutateAsync(changes);
    setShowEditDialog(false);

  };
  const menuItems = [
    {
      icon: Shield,
      label: 'Privacy Policy',
      onClick: () => navigate('/privacy')
    },
    {
      icon: FileText,
      label: 'Terms & Conditions',
      onClick: () => navigate('/tnc')
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      onClick: () => {
        const subject = encodeURIComponent('Habitly Support Request');
        const body = encodeURIComponent(`Hi Habitly team!
    
    I need help with:
    [Please describe your issue here]
    
    Device info:
    - Browser: ${navigator.userAgent}
    - Screen: ${window.innerWidth}x${window.innerHeight}
    `);

        window.location.href = `mailto:support@habitly.app?subject=${subject}&body=${body}`;
      }
    },
  ];

  return (
    <MobileLayout>
      <div className="mobile-container">
        <header className="pt-6 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </Link>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 transition-colors duration-300">
          <div className="flex items-center">
            <UserAvatar user={user} />
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {new Date(user.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={handleEditProfile}
          >
            <Edit size={14} className="mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 transition-colors duration-300 overflow-hidden">
          {/* Cute Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mr-3">
                <BarChart3 size={14} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Your Progress</h2>
                <p className="text-xs text-muted-foreground">Keep up the great work!</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {/* Total Habits */}
              <div className="text-center group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Target size={16} className="text-white" />
                </div>
                <p className="text-xl font-bold text-blue-500 dark:text-blue-400 mb-1">
                  {user.totalHabits}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Habits</p>
              </div>

              {/* Current Streak */}
              <div className="text-center group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Flame size={16} className="text-white" />
                </div>
                <p className="text-xl font-bold text-orange-500 dark:text-orange-400 mb-1">
                  {user.totalStreak}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Streak</p>
              </div>

              {/* Best Streak */}
              <div className="text-center group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                  <Trophy size={16} className="text-white" />
                </div>
                <p className="text-xl font-bold text-green-500 dark:text-green-400 mb-1">
                  {user.longestStreak}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Best</p>
              </div>
            </div>

            {/* Cute Motivational Messages */}
            {user.totalStreak > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200/50 dark:border-yellow-800/30">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mr-3 shadow-sm">
                    {user.totalStreak >= 7 ? '🔥' : user.totalStreak >= 3 ? '⚡' : '🌟'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      {user.totalStreak >= 7
                        ? "You're absolutely crushing it!"
                        : user.totalStreak >= 3
                          ? "Looking good! Keep it up!"
                          : "Great start! 🎉"
                      }
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                      {user.totalStreak >= 7
                        ? `${user.totalStreak} days of pure dedication ✨`
                        : user.totalStreak >= 3
                          ? `${user.totalStreak} days strong and growing 💪`
                          : `Day ${user.totalStreak} - every step counts! 👟`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* New User Encouragement */}
            {user.totalStreak === 0 && user.totalHabits > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center mr-3 shadow-sm">
                    🚀
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      Ready for liftoff?
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      Complete a habit today to start your streak! ⭐
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* First Time User */}
            {user.totalHabits === 0 && (
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mr-3 shadow-sm">
                    ✨
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                      Welcome aboard! 🎊
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                      Create your first habit and watch the magic happen! 🌱
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 transition-colors duration-300">

          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3">
                <Moon size={16} />
              </div>
              <span className="font-medium">Dark Mode</span>
            </div>
            <DarkModeToggle />
          </div>

          <Separator className="dark:bg-gray-700" />

          {menuItems.map((item, index) => (
            <button
              key={index}
              className="flex items-center w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={item.onClick}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 mr-3">
                <item.icon size={16} />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mb-6 text-destructive dark:text-red-400"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          Log out
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal information and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                Display Name
              </Label>
              <div className="relative">
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your display name"
                  className="pl-10"
                />
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">
                This name will be displayed in your profile
              </p>
            </div>

            {/* Timezone Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-timezone" className="text-sm font-medium text-gray-700">
                Timezone
              </Label>
              <TimezoneDropdown value={editTimezone} onChange={setEditTimezone} />
              <p className="text-xs text-gray-500">
                Used for scheduling notifications and displaying times
              </p>
            </div>

            {/* Preview Changes */}
            {(editName.trim() !== (user?.name || '') || editTimezone !== (user?.timezone || '')) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800">Changes Preview</p>
                    <div className="text-xs text-blue-700 space-y-1">
                      {editName.trim() !== (user?.name || '') && (
                        <div>Name: <span className="font-medium">{editName.trim() || 'Not set'}</span></div>
                      )}
                      {editTimezone !== (user?.timezone || '') && (
                        <div>Timezone: <span className="font-medium">{editTimezone}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="flex-1"
              disabled={updateProfileMutation.isPending}
            >
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Profile;
