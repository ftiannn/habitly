import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingLottieProps {
  src: string;
  message?: string;
  className?: string;
}

export const LoadingLottie: React.FC<LoadingLottieProps> = ({ src, message = "Hang tight, good things take time", className }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center`}>
      <div className={className}>
        <DotLottieReact src={src} loop autoplay />
      </div>
      <p className="mt-3 text-sm text-muted-foreground animate-pulse font-medium">
        {message}
      </p>
    </div>
  );
};
