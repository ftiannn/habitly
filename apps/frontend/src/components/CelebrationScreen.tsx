import React, { useEffect, useState } from 'react';

interface CelebrationScreenProps {
  onFinish: () => void;
  duration?: number;
  message?: string;
  streak?: number;
}

const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  onFinish,
  duration = 5000,
  message = "You're blooming beautifully today ✨",
  streak = 0
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 z-[80] transition-all duration-500 overflow-hidden ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      onClick={() => {
        setIsVisible(false);
        setTimeout(onFinish, 500);
      }}
    >
      {/* Animated mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/95 via-orange-400/95 to-yellow-500/95"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <radialGradient id="celebGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          {[...Array(6)].map((_, i) => (
            <circle
              key={i}
              cx={`${25 + (i % 2) * 50}%`}
              cy={`${25 + Math.floor(i / 2) * 25}%`}
              r={`${20 + Math.random() * 15}%`}
              fill="url(#celebGrad)"
              className="animate-pulse"
              style={{
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + Math.random() * 3}s`
              }}
            />
          ))}
        </svg>
      </div>

      {/* Floating celebration particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => {
          const particles = ['🌸', '🌺', '🦋', '✨', '💫', '🌙', '⭐', '💖'];
          const particle = particles[i % particles.length];
          return (
            <div
              key={i}
              className="absolute text-white/30"
              style={{
                fontSize: `${Math.random() * 25 + 15}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationName: 'float-gentle',
                animationDuration: `${6 + Math.random() * 8}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.3}s`
              }}
            >
              {particle}
            </div>
          );
        })}
      </div>

      {/* Morphing celebration blobs */}
      <div className="absolute inset-0">
        {[1, 2, 3].map((blob) => (
          <div
            key={blob}
            className={`absolute w-80 h-80 rounded-full blur-3xl animate-morph-celebration-${blob}`}
            style={{
              background: `radial-gradient(circle, ${blob === 1 ? 'rgba(255,192,203,0.5)' :
                  blob === 2 ? 'rgba(221,160,221,0.5)' :
                    'rgba(173,216,230,0.5)'
                } 0%, transparent 70%)`,
              left: `${blob * 15 + 10}%`,
              top: `${blob * 20 + 5}%`,
              animationDelay: `${blob * 1.5}s`,
              animationDuration: '12s'
            }}
          />
        ))}
      </div>

      {/* Main celebration content */}
      <div className="text-center px-6 max-w-sm mx-auto relative z-10">
        {/* Gentle celebration icon */}
        <div className={`mb-8 transition-all duration-1000 ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-1000 hover:scale-105">
              <div className="text-6xl">🐱</div>
            </div>
            {/* Gentle sparkles around icon */}
            <div className={`absolute -top-2 -right-2 text-2xl transition-all duration-700 delay-500 ${animate ? 'scale-100 rotate-12 opacity-100' : 'scale-0 rotate-0 opacity-0'}`}>
              ✨
            </div>
            <div className={`absolute -bottom-1 -left-3 text-xl transition-all duration-700 delay-700 ${animate ? 'scale-100 -rotate-12 opacity-100' : 'scale-0 rotate-0 opacity-0'}`}>
              💫
            </div>
          </div>
        </div>

        {/* Success message with gentle animation */}
        <h1 className="text-3xl font-semibold text-orange-800 mb-6 leading-tight drop-shadow-lg">
          {message.split(' ').map((word, index) => (
            <span
              key={index}
              className="inline-block mr-2"
              style={{
                transition: 'all 0.8s ease-out',
                transitionDelay: `${800 + index * 150}ms`,
                transform: animate ? 'translateY(0)' : 'translateY(20px)',
                opacity: animate ? 1 : 0
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Streak display with gentle glow */}
        {streak > 0 && (
          <div className={`bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-6 mb-8 border border-white/40 shadow-xl transition-all duration-1000 delay-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-pink-100 bg-clip-text">
              {streak}
            </div>
            <div className="text-white/90 text-base font-medium flex items-center justify-center gap-2">
              {streak === 1 ? 'First beautiful step' :
                streak < 7 ? 'Days of gentle growth' :
                  streak < 30 ? 'Weeks of beautiful progress' :
                    streak < 100 ? 'Your garden is flourishing' :
                      'A truly magnificent journey'} 🌱
            </div>
          </div>
        )}

        {/* Gentle celebration elements */}
        <div className="flex justify-center gap-4 mb-8">
          {['🐱', '🐾', '🧶', '🥛'].map((emoji, index) => (
            <div
              key={index}
              className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-700 hover:scale-110"
              style={{
                transitionDelay: `${1200 + index * 150}ms`,
                transform: animate ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
                opacity: animate ? 1 : 0,
                animationName: animate ? 'gentle-float' : 'none',
                animationDuration: `${3 + (index * 0.4)}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${1500 + index * 200}ms`
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Encouraging message */}
        <p className={`text-white/90 text-lg mb-8 font-light drop-shadow-sm transition-all duration-1000 delay-[1800ms] ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {streak === 0 ? "Every small step creates ripples of change 🌊" :
            streak === 1 ? "You've planted the first seed of transformation 🌱" :
              streak < 7 ? "Your new rhythm is taking beautiful shape 🎵" :
                streak < 21 ? "You're creating something truly special ✨" :
                  streak < 50 ? "Your consistency is inspiring and graceful 🦋" :
                    streak < 100 ? "You've cultivated something extraordinary 🌸" :
                      "You are a living example of gentle persistence 🌙"}
        </p>

        {/* Gentle tap instruction */}
        <div className={`animate-pulse transition-all duration-1000 delay-[2000ms] ${animate ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white/70 text-sm font-light">
            Tap to continue nurturing your garden
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes morph-celebration-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(20px, -30px) scale(1.1) rotate(60deg); }
          66% { transform: translate(-15px, 15px) scale(0.9) rotate(120deg); }
        }
        
        @keyframes morph-celebration-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(-25px, 20px) scale(1.2) rotate(-60deg); }
          66% { transform: translate(30px, -20px) scale(0.8) rotate(-120deg); }
        }
        
        @keyframes morph-celebration-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          33% { transform: translate(15px, 25px) scale(0.9) rotate(45deg); }
          66% { transform: translate(-20px, -15px) scale(1.1) rotate(90deg); }
        }
      `}</style>
    </div>
  );
};

export default CelebrationScreen;