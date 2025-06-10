import { createContext, useContext } from "react";

type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

export const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
      throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
  };
  