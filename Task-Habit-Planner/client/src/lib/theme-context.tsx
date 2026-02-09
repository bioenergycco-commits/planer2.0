import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'pro' | 'calm';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('flow_theme') as Theme) || 'pro';
  });

  useEffect(() => {
    localStorage.setItem('flow_theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('theme-pro', 'theme-calm');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
