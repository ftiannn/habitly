import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen = ({ onFinish, duration = 3000 }: SplashScreenProps) => {
  const [show, setShow] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);

    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onFinish(), 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-300 via-orange-400 to-yellow-500 z-[100] transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      {/* Cat Icon */}
      <div className={`relative mb-8 transition-all duration-1000 ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
        <img 
          src="/favicon-96x96.png"  // Your cat icon
          alt="Habitly Cat"
          className="w-32 h-32 rounded-full shadow-2xl"
        />
        
        {/* Playful ripple effects */}
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className="absolute inset-0 border-2 border-white/40 rounded-full animate-ping"
            style={{
              animationDelay: `${ring * 0.5}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>

      {/* App name */}
      <h1 className={`text-4xl font-bold text-orange-800 mb-4 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        Habitly
      </h1>

      {/* Cat-themed subtitle */}
      <p className={`text-orange-700 text-lg font-medium transition-all duration-1000 delay-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        Tiny steps, Big shifts 🐾
      </p>
    </div>
  );
};

export default SplashScreen;