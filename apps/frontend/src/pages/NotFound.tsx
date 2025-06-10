import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LoadingLottie } from "@/components/ui";
import { LOTTIE_ANIMATIONS } from "@/constants/lottie-animations";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "🚨 Oopsie! Someone wandered into the digital wilderness:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-8 py-16">
      <div className="max-w-2xl w-full text-center space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-rose-500">Oopsie...</h1>
          <p className="text-sm text-gray-600">It was here… then *poof*. 🐾</p>
        </div>

        {/* Lottie */}
        <div className="relative">
          <LoadingLottie
            className="w-64 h-64 mx-auto"
            src={LOTTIE_ANIMATIONS.notFound}
            message="She was just stretching. Probably."
          />
          <div className="absolute top-4 right-8 text-xl animate-pulse opacity-50">✨</div>
          <div className="absolute bottom-12 left-8 text-lg animate-pulse opacity-40">✨</div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 max-w-md mx-auto leading-relaxed">
          The cat says she didn’t touch anything. We’re not so sure.
        </p>

        {/* CTA Button */}
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🏡 Take me Home
          </a>
        </div>

      </div>
    </div>


  );
};

export default NotFound;

