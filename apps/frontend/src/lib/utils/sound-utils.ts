/**
 * Utility functions for managing sounds in the application
 */

// Various celebration sound files 
export const CELEBRATION_SOUNDS = [
  // '/sounds/celebration1.mp3', // cat
  '/sounds/celebration2.mp3', // baby laugh
  // '/sounds/celebration3.mp3', // harp
  // '/sounds/celebration4.mp3', // man
  // '/sounds/celebration5.mp3', // yay
];

// Sound file paths
export const SOUNDS = {
  // The firework pop sound
  FIREWORK: '/sounds/firework.mp3',
};

// In-memory storage for current session
let currentSoundEnabled = true;
const sessionSounds: Record<string, string> = {};

/**
 * Returns a celebration sound. Randomly selects from available options.
 */
export const getTodayCelebrationSound = (): string => {
  const today = new Date().toLocaleDateString();
  
  // If we already selected a sound for today in this session, use that one
  if (sessionSounds[today]) {
    return sessionSounds[today];
  }

  // Otherwise, select a new random sound for today
  const randomIndex = Math.floor(Math.random() * CELEBRATION_SOUNDS.length);
  const selectedSound = CELEBRATION_SOUNDS[randomIndex];

  // Save it for this session
  sessionSounds[today] = selectedSound;

  return selectedSound;
};

// Get user sound preference from memory (session-based)
export const getSoundPreference = (): boolean => {
  return currentSoundEnabled;
};

// Save user sound preference to memory (session-based)
export const setSoundPreference = (enabled: boolean): void => {
  currentSoundEnabled = enabled;
};

// Preload all possible sounds for better performance
export const preloadSounds = (): void => {
  // Preload all celebration sounds
  CELEBRATION_SOUNDS.forEach(soundPath => {
    const audio = new Audio(soundPath);
    audio.preload = 'auto';
    audio.load();
  });

  // Preload other sound effects
  Object.values(SOUNDS).forEach(soundPath => {
    const audio = new Audio(soundPath);
    audio.preload = 'auto';
    audio.load();
  });
};