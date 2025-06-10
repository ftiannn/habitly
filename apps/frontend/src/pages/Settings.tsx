import { useState, useEffect, useMemo } from 'react';
import { MobileLayout } from '@/components/MobileLayout';
import { useUserSettings, useUpdateUserSettings } from '@/lib/hooks/use-user';
import { Button, Label, Switch, Separator, TimeInput, LoadingLottie } from '@/components/ui';
import {
  ArrowLeft,
  Save,
  Bell,
  Shield,
  Clock,
  Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { settingsSchema, getValidationErrors } from '@/lib/utils/validation-utils';
import { UserSettings } from '@/types';
import { LOTTIE_ANIMATIONS } from '@/constants/lottie-animations';

const Settings = () => {
  const navigate = useNavigate();
  const { data: settings, isLoading, error } = useUserSettings();
  const updateSettingsMutation = useUpdateUserSettings();

  const [formData, setFormData] = useState<UserSettings>({
    emailNotifications: true,
    publicProfile: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        emailNotifications: settings.emailNotifications ?? true,
        publicProfile: settings.publicProfile ?? false,
        quietHoursEnabled: settings.quietHoursEnabled ?? false,
        quietHoursStart: settings.quietHoursStart ?? '22:00',
        quietHoursEnd: settings.quietHoursEnd ?? '08:00',
      });
    }
  }, [settings]);

  const updateField = <K extends keyof UserSettings>(
    field: K,
    value: UserSettings[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const originalSettings = useMemo(() => {
    if (!settings) return null;
    return {
      emailNotifications: settings.emailNotifications ?? true,
      publicProfile: settings.publicProfile ?? false,
      quietHoursEnabled: settings.quietHoursEnabled ?? false,
      quietHoursStart: settings.quietHoursStart ?? '22:00',
      quietHoursEnd: settings.quietHoursEnd ?? '08:00',
    };
  }, [settings]);

  const changedFields = useMemo(() => {
    if (!originalSettings) return {};

    const changes: Partial<UserSettings> = {};
    (Object.keys(formData) as (keyof UserSettings)[]).forEach((key) => {
      if (formData[key] !== originalSettings[key]) {
        changes[key as string] = formData[key];
      }
    });

    return changes;
  }, [originalSettings, formData]);

  const hasChanges = Object.keys(changedFields).length > 0;

  const handleSaveSettings = async () => {
    if (!hasChanges) {
      navigate('/profile');
      return;
    }

    // Validate the full form data for context
    const validation = settingsSchema.safeParse(formData);
    if (!validation.success) {
      const errors = getValidationErrors(validation.error);
      const firstErrorMessage = Object.values(errors)[0];
      toast.error(firstErrorMessage);
      return;
    }

    try {
      // Send only changed fields to API
      await updateSettingsMutation.mutateAsync(changedFields);
      navigate('/profile');
    } catch (error) {
      console.error(error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <MobileLayout>
        <div className="mobile-container flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <LoadingLottie
            className="flex items-center justify-center"
            src={LOTTIE_ANIMATIONS.basicLoader}
            message="Tuning your vibe settings..."
          />
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="mobile-container">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-destructive">Failed to load settings</div>
            <Button onClick={() => window.location.reload()} size="sm">
              Try again
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="mobile-container pb-32">
        {/* Header */}
        <header className="pt-6 pb-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
          {hasChanges && (
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              size="sm"
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          )}
        </header>

        {/* Settings Content */}
        <div className="space-y-4 pb-6">
          {/* Notifications Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mr-3">
                <Bell size={14} className="text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about habit reminders
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={formData.emailNotifications}
                onCheckedChange={(value) => updateField('emailNotifications', value)}
              />
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                <Shield size={14} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold">Privacy</h2>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="public-profile" className="font-medium cursor-pointer">
                  Public Profile
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your achievements
                </p>
              </div>
              <Switch
                id="public-profile"
                checked={formData.publicProfile}
                onCheckedChange={(value) => updateField('publicProfile', value)}
              />
            </div>
          </div>

          {/* Quiet Hours Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                <Clock size={14} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold">Quiet Hours</h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="quiet-hours" className="font-medium cursor-pointer">
                    Enable Quiet Hours
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Disable notifications during specific hours
                  </p>
                </div>
                <Switch
                  id="quiet-hours"
                  checked={formData.quietHoursEnabled}
                  onCheckedChange={(value) => updateField('quietHoursEnabled', value)}
                />
              </div>

              {formData.quietHoursEnabled && (
                <>
                  <Separator />
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <TimeInput
                        id="quiet-start"
                        label="Start Time"
                        value={formData.quietHoursStart}
                        onChange={(val) => updateField('quietHoursStart', val)}
                      />
                      <TimeInput
                        id="quiet-end"
                        label="End Time"
                        value={formData.quietHoursEnd}
                        onChange={(val) => updateField('quietHoursEnd', val)}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Notifications will be paused between the selected times.
                      {formData.quietHoursStart > formData.quietHoursEnd && (
                        <span className="block text-blue-600 dark:text-blue-400 mt-1">
                          ✨ Overnight mode: {formData.quietHoursStart} → {formData.quietHoursEnd}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Settings;