import { useEffect, useRef, useState } from 'react';

interface SoundEffectProps {
  src: string; 
  play: boolean;
  volume?: number;
  loop?: boolean;
  onEnded?: () => void;
  repeat?: number; // Number of times to automatically replay the sound
  retrigger?: boolean; // Whether to restart when play changes to true even if already playing
}

/**
 * Component for playing sound effects with browser compatibility
 */
export const SoundEffect = ({ 
  src, 
  play, 
  volume = 0.5, 
  loop = false, 
  onEnded,
  repeat = 0, // Default to no auto-repeat
  retrigger = false // Default to not retriggering
}: SoundEffectProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const maxPlays = repeat + 1; // Original play + repeats

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
      
      // Custom ended handler to manage auto-replay
      const handleEnded = () => {
        if (repeat > 0 && playCount < repeat) {
          // Auto-replay if we haven't reached max plays
          setPlayCount(prevCount => prevCount + 1);
          
          // Reset to beginning and play again
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => 
              console.warn('Auto-replay failed:', err)
            );
          }
        }
        
        // Always call the user's onEnded callback if provided
        if (onEnded) onEnded();
      };
      
      audioRef.current.addEventListener('ended', handleEnded);
    }

    // Update properties if they change
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
    }

    return () => {
      // Clean up
      if (audioRef.current) {
        audioRef.current.pause();
        // Remove our custom ended handler too
        audioRef.current.removeEventListener('ended', audioRef.current.onended as EventListener);
        audioRef.current = null;
      }
    };
  }, [src, volume, loop, onEnded, repeat, playCount]);

  // Control playback when play prop changes
  useEffect(() => {
    if (!audioRef.current) return;

    // iOS and some browsers require user interaction to play audio
    // This is a workaround to play audio after the user has interacted with the page
    const playAudio = async () => {
      try {
        if (play) {
          // Reset play count when starting a new sequence
          setPlayCount(0);
          
          // If retrigger is true or audio is not currently playing, start playback
          if (retrigger || audioRef.current.paused) {
            // Reset to beginning for consistent playback
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
          }
        } else {
          audioRef.current.pause();
        }
      } catch (error) {
        console.warn('Could not play audio. User interaction may be required:', error);
      }
    };

    playAudio();
  }, [play, retrigger]);

  // This component doesn't render anything visible
  return null;
};

export default SoundEffect;