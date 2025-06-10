
import { Toaster, TooltipProvider, LoadingLottie } from "@/components/ui";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/query-client";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AddHabit from "./pages/AddHabit";
import EditHabit from "./pages/EditHabit";
import BadgesPage from "./pages/BadgesPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { LOTTIE_ANIMATIONS } from "./constants/lottie-animations";
import { useAuth } from '@/lib/hooks/use-auth'
import PrivacyPolicy from "./pages/PrivacyPage";
import TermsAndConditions from "./pages/TermsAndCondition";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center space-y-2">
        <LoadingLottie
          className="w-80 h-80"
          src={LOTTIE_ANIMATIONS.appLoading}
          message=""
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const isFirstLoad = !sessionStorage.getItem('app_loaded');

    if (!isFirstLoad) {
      setShowSplash(false);
      setAppReady(true);
    } else {
      sessionStorage.setItem('app_loaded', 'true');
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setAppReady(true);
  };


  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <TooltipProvider>
          <Toaster />
          {showSplash && <SplashScreen onFinish={handleSplashComplete} />}

          {appReady && (
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />

                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/tnc" element={<TermsAndConditions />} />

                  <Route path="/" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />

                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <CalendarPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/badges" element={
                    <ProtectedRoute>
                      <BadgesPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />

                  <Route path="/add-habit" element={
                    <ProtectedRoute>
                      <AddHabit />
                    </ProtectedRoute>
                  } />

                  <Route path="/edit-habit/:habitId" element={
                    <ProtectedRoute>
                      <EditHabit />
                    </ProtectedRoute>
                  } />


                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  );
};

export default App;
