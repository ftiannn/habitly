import { SocialLogin } from '@capgo/capacitor-social-login';
import { AUTH_CONFIG } from '@/config/environment';
import { Button } from '@/components/ui';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth'

interface GoogleButtonProps {
  text?: string;
  onSuccess?: () => void;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  text = "Continue with Google",
  onSuccess
}) => {
  const { googleLogin, isLoading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await SocialLogin.initialize({
          google: {
            iOSClientId: AUTH_CONFIG.GOOGLE_IOS_CLIENT_ID,
            iOSServerClientId: AUTH_CONFIG.GOOGLE_CLIENT_ID,
            webClientId: AUTH_CONFIG.GOOGLE_CLIENT_ID,
            androidClientId: AUTH_CONFIG.GOOGLE_ANDROID_CLIENT_ID
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize SocialLogin:', error);
        toast.error(`Failed to initialize Google authentication: ${error.message}`);
      }
    };

    initializeGoogleAuth();
  }, []);

  const handleGoogleLogin = async () => {
    if (!isInitialized) {
      toast.error('Google authentication not ready');
      return;
    }

    setIsGoogleLoading(true);

    try {


      console.log('🚀 Starting Google login...');

      const result = await SocialLogin.login({
        provider: 'google',
        options: {},
      });


      if (!result?.result?.idToken) {
        throw new Error('No ID token received from Google');
      }

      const success = await googleLogin(result.result.idToken);

      if (success) {
        toast.success('Successfully signed in with Google!');
        onSuccess?.();
      } else {
        throw new Error('Backend authentication failed');
      }

    } catch (error) {
      console.error('Google Login Error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        status: error.status,
        data: error.data
      });

      // Enhanced error handling
      if (error.message?.includes('user_cancelled') || error.message?.includes('cancelled')) {
        toast.info('Google sign-in was cancelled');
      } else if (error.message?.includes('network_error')) {
        toast.error('Network error. Please check your connection.');
      } else if (error.status === 500) {
        toast.error(`Internal server error`);
      } else {
        toast.error(`Google sign-in failed: ${error.message}`);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-xl py-6 flex items-center justify-center"
      onClick={handleGoogleLogin}
      disabled={isLoading || isGoogleLoading || !isInitialized}
    >
      {isGoogleLoading ? (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
      ) : (
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {!isInitialized ? 'Loading...' : text}
    </Button>
  );
};

export default GoogleButton;