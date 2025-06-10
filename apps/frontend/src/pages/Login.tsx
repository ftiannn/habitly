import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import GoogleButton from '@/components/GoogleButton';
import { LoadingLottie } from '@/components/ui';
import { LOTTIE_ANIMATIONS } from '@/constants/lottie-animations';
import { useAuth } from '@/lib/hooks/use-auth'

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center space-y-2">
        <LoadingLottie
          className="w-80 h-80"
          src={LOTTIE_ANIMATIONS.appLoading}
          message="Getting things ready..."
        />
        <p className="mt-3 text-xs text-muted-foreground animate-pulse font-medium pt-5">Manifesting good vibes and fresh starts</p>
      </div>

    );
  }

  return (
    <MobileLayout hideNav>      <div className="mobile-container flex flex-col justify-center min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Habitly</h1>
        <p className="text-muted-foreground mt-2">Track your habits, build your routine</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign in to continue</h2>

        <p className="text-muted-foreground text-center mb-8">
          Access your habits and continue building your daily routine.
        </p>

        <GoogleButton onSuccess={() => navigate('/')} />

        <div className="mt-8 text-center text-xs text-muted-foreground px-4">
          <p>
            By signing in, you agree to our{" "}
            <Link to="/tnc" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
    </MobileLayout>

  );
};

export default Login;